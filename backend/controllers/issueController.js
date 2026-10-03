import mongoose from "mongoose";
import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
// ==== NOTIFICATION EDIT: START ====
import { notify, notifyAdmins } from '../services/notificationService.js';
// ==== NOTIFICATION EDIT: END ====
import { isSelectableCategory, canonicalCategoryName } from './categoryController.js';
import {
  CLOUDINARY_FOLDERS,
  uploadBuffer,
  fetchAsset,
  deleteAssets,
  isOwnedPublicId,
} from "../services/cloudinaryService.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import { validateMediaFile } from "../utils/mediaValidation.js";
import { MAX_ISSUE_MEDIA_COUNT } from "../config/media.js";

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

// Attach comment counts and flatten reporter info so the frontend can
// render list/single views without extra round-trips.
async function withMeta(issues) {
  if (!issues.length) return [];
  const ids = issues.map((i) => i._id);
  const counts = await Comment.aggregate([
    { $match: { issue: { $in: ids } } },
    { $group: { _id: "$issue", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  counts.forEach((c) => {
    countMap[String(c._id)] = c.count;
  });
  return issues.map((i) => ({
    ...i.toObject(),
    comments: countMap[String(i._id)] || 0,
  }));
}

// Files uploaded through the backend (small/medium media). Validates the real
// content of each file, streams it to the correct Cloudinary folder and rolls
// back anything already uploaded if a later file fails.
async function uploadIssueFiles(files = []) {
  const uploaded = [];
  try {
    for (const file of files) {
      const check = validateMediaFile(file, ["image", "video"]);
      if (!check.ok) throw badRequest(check.error);

      const folder =
        check.resourceType === "image"
          ? CLOUDINARY_FOLDERS.issueImages
          : CLOUDINARY_FOLDERS.issueVideos;

      const asset = await uploadBuffer(file.buffer, {
        resourceType: check.resourceType,
        folder,
      });
      uploaded.push(asset);
    }
    return uploaded;
  } catch (err) {
    await deleteAssets(
      uploaded.map((a) => ({ publicId: a.publicId, resourceType: a.resourceType })),
    );
    throw err;
  }
}

// Media uploaded straight from the browser via a signed request. The client
// only sends a publicId + resourceType; we re-fetch authoritative metadata
// from Cloudinary and reject anything outside our folders.
async function resolveClientMedia(raw) {
  if (raw === undefined || raw === null || raw === "") return [];
  let list;
  try {
    list = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw badRequest("Invalid media reference.");
  }
  if (!Array.isArray(list)) throw badRequest("Invalid media reference.");

  const resolved = [];
  for (const item of list) {
    const publicId = item?.publicId;
    const resourceType = item?.resourceType;
    if (!publicId || !["image", "video"].includes(resourceType)) {
      throw badRequest("Invalid media reference.");
    }
    const allowedFolders =
      resourceType === "image"
        ? [CLOUDINARY_FOLDERS.issueImages]
        : [CLOUDINARY_FOLDERS.issueVideos];

    if (!isOwnedPublicId(publicId, allowedFolders)) {
      throw badRequest("Uploaded media does not belong to an allowed folder.");
    }
    resolved.push(await fetchAsset(publicId, resourceType));
  }
  return resolved;
}

// Existing media the client chose to keep (array of publicIds or { publicId }).
function parseKeptPublicIds(raw, existing = []) {
  if (raw === undefined || raw === null || raw === "") {
    return existing.map((m) => m.publicId);
  }
  let list;
  try {
    list = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw badRequest("Invalid media selection.");
  }
  if (!Array.isArray(list)) throw badRequest("Invalid media selection.");
  return list.map((item) =>
    typeof item === "string" ? item : item?.publicId,
  ).filter(Boolean);
}

// Mirror image URLs into the legacy `photos`/`img` fields so existing feed
// components keep working without changes.
function buildLegacyFields(media = []) {
  const photos = media.filter((m) => m.resourceType === "image").map((m) => m.url);
  return { photos, img: photos[0] || "" };
}

// Only approved reports are public. EVERY new report waits as "pending" until
// an admin approves it - there is no auto-approval, not even for admins' own
// posts. Admins can also take a post down later by flagging it as spam or
// rejecting it. While a post is not approved, its owner (on their profile) and
// admins are the only ones who can see it. Documents written before the
// moderationStatus field existed have no value and count as approved, hence
// the `null` in $in (it matches missing fields too).
const PUBLICLY_VISIBLE = { moderationStatus: { $in: ['approved', null] } };

// Thana is the report's main location. Trim what was typed; if the form sent no
// thana, recover it from the "Thana: X" part of the composed address so the
// analytics "Top reporting areas" chart never loses a report.
function normalizeLocation(data) {
  if (data.thana !== undefined) data.thana = String(data.thana).trim();
  if (data.city !== undefined) data.city = String(data.city).trim();
  if (!data.thana && data.address) {
    const m = String(data.address).match(/Thana:\s*([^,]+)/i);
    if (m) data.thana = m[1].trim();
  }
  return data;
}

function isPublic(issue) {
  return !issue.moderationStatus || issue.moderationStatus === 'approved';
}

// GET /api/issues — public feed (optionalAuth: signed-in users don't get the
// posts they hid)
export async function getIssues(req, res) {
  try {
    const filter = { ...PUBLICLY_VISIBLE };
    if (req.user?.hiddenIssues?.length) {
      filter._id = { $nin: req.user.hiddenIssues };
    }
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name avatar profilePicture")
      .select("-photos");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/stats — public headline numbers for the feed hero box.
// Counts APPROVED reports only, for everybody (it ignores per-user hidden posts).
// A report with no statusLabel counts as "Open", matching the schema default.
export async function getIssueStats(req, res) {
  try {
    const rows = await Issue.aggregate([
      { $match: PUBLICLY_VISIBLE },
      { $group: { _id: { $ifNull: ["$statusLabel", "Open"] }, count: { $sum: 1 } } },
    ]);
    const by = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    res.json({
      open: by["Open"] || 0,
      inProgress: by["In progress"] || 0,
      resolved: by["Resolved"] || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/:id — public single issue (for accessing any post)
export async function getIssueById(req, res) {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "user",
      "name avatar profilePicture",
    );
    if (!issue) return res.status(404).json({ message: "Not found" });
    // Non-public posts (pending / spam / rejected) 404 rather than 403 so their
    // existence is not leaked. The owner and admins may still open them.
    if (!isPublic(issue)) {
      const ownerId = String(issue.user?._id || issue.user);
      const canSee =
        req.user && (req.user.isAdmin || String(req.user._id) === ownerId);
      if (!canSee) return res.status(404).json({ message: "Not found" });
    }
    res.json((await withMeta([issue]))[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/mine
export async function getMyIssues(req, res) {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar profilePicture");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/upvoted — issues the current user has upvoted
export async function getUpvotedIssues(req, res) {
  try {
    const issues = await Issue.find({ upvotedBy: req.user._id, ...PUBLICLY_VISIBLE })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar profilePicture")
      .select("-photos");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/issues — multipart/form-data with optional `media` files and a
// JSON `uploadedMedia` field for assets already uploaded directly to Cloudinary.
export async function createIssue(req, res) {
  const files = req.files || [];
  try {
    const direct = await resolveClientMedia(req.body.uploadedMedia);

    if (files.length + direct.length > MAX_ISSUE_MEDIA_COUNT) {
      throw badRequest(
        `Too many media files. Maximum is ${MAX_ISSUE_MEDIA_COUNT}.`,
      );
    }

    const uploaded = await uploadIssueFiles(files);
    const media = [...uploaded, ...direct];

    const data = { ...req.body };
    delete data.media;
    delete data.uploadedMedia;
    delete data.keptMedia;
    delete data.user;
    // Moderation and vote fields are server-controlled; never trust the client.
    delete data.moderationStatus;
    delete data.moderatedAt;
    delete data.moderatedBy;
    delete data.up;
    delete data.down;
    delete data.upvotedBy;

    normalizeLocation(data);

    // The category must be one the admin currently offers (the report form's
    // dropdown is filled from the same list).
    if (!(await isSelectableCategory(data.category))) {
      throw badRequest('Please choose a valid category.');
    }
    data.category = await canonicalCategoryName(data.category);

    // Nothing is auto-approved: every report is "pending" until an admin
    // approves it from the admin panel.
    const issue = await Issue.create({
      ...data,
      ...buildLegacyFields(media),
      media,
      moderationStatus: 'pending',
      moderatedAt: null,
      moderatedBy: null,
      user: req.user._id,
    });

    // Tell the admins it is waiting. The notification opens Manage Issues with
    // this post highlighted (see notificationStore.js).
    notifyAdmins({
      exceptUserId: req.user._id,
      type: 'moderation',
      actorId: req.user._id,
      actorName: req.user.name,
      targetType: 'Issue',
      targetId: issue._id,
      issueId: issue._id,
      title: 'New report awaiting review',
      message: `${req.user.name} submitted "${issue.title}". Approve, flag or reject it.`,
    });

    // Match the read endpoints, which populate the reporter; otherwise every
    // consumer sees a bare ObjectId for `user`.
    await issue.populate("user", "name avatar profilePicture");
    res.status(201).json(issue);
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({
      message: err.message || "Could not create issue.",
      code: err.code,
    });
  }
}

// PUT /api/issues/:id — malik chara keo edit korte parbe na
export async function updateIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const files = req.files || [];
    const existingMedia = issue.media || [];
    const structured =
      files.length > 0 ||
      req.body.uploadedMedia !== undefined ||
      req.body.keptMedia !== undefined;

    const data = { ...req.body };
    delete data.media;
    delete data.uploadedMedia;
    delete data.keptMedia;
    delete data.user;
    // Otherwise an owner could approve their own report with a crafted request.
    delete data.moderationStatus;
    delete data.moderatedAt;
    delete data.moderatedBy;
    delete data.up;
    delete data.down;
    delete data.upvotedBy;

    normalizeLocation(data);
    // Only re-check the category when the owner actually changed it, so editing
    // an old report whose category was later deleted still works.
    if (data.category !== undefined && data.category !== issue.category) {
      if (!(await isSelectableCategory(data.category))) {
        throw badRequest('Please choose a valid category.');
      }
      data.category = await canonicalCategoryName(data.category);
    }

    if (!structured) {
      // Legacy JSON update: keep existing media fields untouched.
      Object.assign(issue, data);
      await issue.save();
      await issue.populate("user", "name avatar profilePicture");
      return res.json(issue);
    }

    const keptIds = parseKeptPublicIds(req.body.keptMedia, existingMedia);
    const kept = existingMedia.filter((m) => keptIds.includes(m.publicId));
    const removed = existingMedia.filter(
      (m) => !keptIds.includes(m.publicId),
    );

    const uploaded = await uploadIssueFiles(files);
    const direct = await resolveClientMedia(req.body.uploadedMedia);
    const media = [...kept, ...uploaded, ...direct];

    if (media.length > MAX_ISSUE_MEDIA_COUNT) {
      await deleteAssets(
        [...uploaded, ...direct].map((a) => ({
          publicId: a.publicId,
          resourceType: a.resourceType,
        })),
      );
      throw badRequest(
        `Too many media files. Maximum is ${MAX_ISSUE_MEDIA_COUNT}.`,
      );
    }

    Object.assign(issue, data, buildLegacyFields(media), { media });
    await issue.save();

    if (removed.length) {
      const failures = await deleteAssets(
        removed.map((m) => ({ publicId: m.publicId, resourceType: m.resourceType })),
      );
      if (failures.length) {
        console.error(
          "[issue] Orphaned Cloudinary assets after update:",
          JSON.stringify(failures),
        );
      }
    }

    res.json(await issue.populate("user", "name avatar profilePicture"));
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ message: err.message || "Update failed" });
  }
}

// DELETE /api/issues/:id
export async function deleteIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const media = issue.media || [];

    // Remove Cloudinary assets first. If this fails while Cloudinary is
    // configured, abort so we never lose track of orphaned media.
    if (media.length && isCloudinaryConfigured) {
      const failures = await deleteAssets(
        media.map((m) => ({ publicId: m.publicId, resourceType: m.resourceType })),
      );
      if (failures.length) {
        console.error(
          "[issue] Cloudinary deletion failed; keeping issue record:",
          JSON.stringify(failures),
        );
        return res.status(502).json({
          message:
            "Some media could not be removed from storage. The report was not deleted — please try again.",
        });
      }
    }

    await issue.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: "Server error", error: err.message });
  }
}

// ==== NOTIFICATION EDIT: START ====
// PATCH /api/issues/:id/upvote — toggle upvote, notify the owner
export async function upvoteIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || !isPublic(issue)) {
      return res.status(404).json({ message: "Not found" });
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = issue.upvotedBy.some(
      (id) => id.toString() === userId,
    );

    if (alreadyUpvoted) {
      // toggle off — un-upvote
      issue.upvotedBy = issue.upvotedBy.filter(
        (id) => id.toString() !== userId,
      );
      issue.up = Math.max(0, issue.up - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.up += 1;
    }

    // Commit the primary mutation before notifying so a notification failure
    // can never cost the user their upvote.
    await issue.save();

    if (!alreadyUpvoted && issue.user.toString() !== userId) {
      notify({
        recipientId: issue.user,
        type: 'upvote',
        actorId: req.user._id,
        actorName: req.user.name,
        targetType: 'Issue',
        targetId: issue._id,
        subject: `your report "${issue.title}"`,
        title: 'New Upvote',
      });
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PATCH /api/issues/:id/hide — hide a post from the current user's feed only
export async function hideIssue(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }
    const exists = await Issue.exists({ _id: id });
    if (!exists) return res.status(404).json({ message: "Not found" });

    // $addToSet keeps the list free of duplicates if the request is repeated.
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { hiddenIssues: id } },
    );
    res.json({ id, hidden: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PATCH /api/issues/:id/status — admin-only, notify the report owner
// Separate from updateIssue because that route is owner-only; an admin
// changing someone else's issue status needs its own permission check.
export async function updateIssueStatus(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { statusLabel, statusClass } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

    if (statusLabel) issue.statusLabel = statusLabel;
    if (statusClass !== undefined) issue.statusClass = statusClass;
    await issue.save();

    notify({
      recipientId: issue.user,
      type: "status",
      targetType: "Issue",
      targetId: issue._id,
      title: "Report Status Updated",
      message: `Your report "${issue.title}" has been marked as ${issue.statusLabel}.`,
    });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
// ==== NOTIFICATION EDIT: END ====
