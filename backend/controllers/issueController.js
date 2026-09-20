import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
// ==== NOTIFICATION EDIT: START ====
import { createNotification } from "../services/notificationService.js";
// ==== NOTIFICATION EDIT: END ====

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

// GET /api/issues — public feed
export async function getIssues(req, res) {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .populate("user", "name avatar")
      .select("-photos");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/:id — public single issue
export async function getIssueById(req, res) {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "user",
      "name avatar",
    );
    if (!issue) return res.status(404).json({ message: "Not found" });
    res.json((await withMeta([issue]))[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/mine — শুধু নিজেরটা
export async function getMyIssues(req, res) {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/issues/upvoted — issues the current user has upvoted
export async function getUpvotedIssues(req, res) {
  try {
    const issues = await Issue.find({ upvotedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar")
      .select("-photos");
    res.json(await withMeta(issues));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/issues
export async function createIssue(req, res) {
  try {
    const issue = await Issue.create({ ...req.body, user: req.user._id });
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
}

// PUT /api/issues/:id — মালিক ছাড়া কেউ এডিট করতে পারবে না
export async function updateIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }
    Object.assign(issue, req.body);
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
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
    await issue.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ==== NOTIFICATION EDIT: START ====
// PATCH /api/issues/:id/upvote — toggle upvote, notify the owner
export async function upvoteIssue(req, res) {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

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

      if (issue.user.toString() !== userId) {
        await createNotification({
          recipientId: issue.user,
          type: "upvote",
          actorId: req.user._id,
          actorName: req.user.name,
          targetType: "Issue",
          targetId: issue._id,
          subject: `your report "${issue.title}"`,
          title: "New Upvote",
        });
      }
    }

    await issue.save();
    res.json(issue);
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

    await createNotification({
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
