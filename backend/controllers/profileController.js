import User from "../models/User.js";
import {
  CLOUDINARY_FOLDERS,
  uploadBuffer,
  deleteAsset,
} from "../services/cloudinaryService.js";
import { validateMediaFile } from "../utils/mediaValidation.js";

// GET /api/profile
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/profile
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // `avatar` is intentionally excluded: profile pictures now go through
    // POST /api/profile/picture and must be Cloudinary references.
    const editableFields = ["name", "email", "phone", "bio"];
    editableFields.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    if (req.body.address) {
      user.address = { ...user.address.toObject(), ...req.body.address };
    }
    if (req.body.privacy) {
      user.privacy = { ...user.privacy.toObject(), ...req.body.privacy };
    }

    const updatedUser = await user.save();
    const { password, ...safeUser } = updatedUser.toObject();
    res.status(200).json(safeUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/profile/picture — multipart field name: "profilePicture"
export async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image was uploaded." });
    }

    const check = validateMediaFile(req.file, ["image"]);
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.error, code: check.code });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Upload the new image first. The old one is only removed after the new
    // reference is safely persisted, so a failed upload never leaves the user
    // without a profile picture.
    const asset = await uploadBuffer(req.file.buffer, {
      resourceType: "image",
      folder: CLOUDINARY_FOLDERS.userProfile,
    });

    const previousPublicId = user.profilePicture?.publicId;

    user.profilePicture = asset;
    user.avatar = asset.url; // keep the legacy mirror used across the UI
    await user.save();

    if (previousPublicId && previousPublicId !== asset.publicId) {
      try {
        await deleteAsset(previousPublicId, "image");
      } catch (err) {
        // Not fatal: the new picture is already live. Log the orphaned asset.
        console.error(
          "[profile] Failed to delete replaced Cloudinary asset:",
          previousPublicId,
          err.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated.",
      data: { profilePicture: user.profilePicture, avatar: user.avatar },
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture controller:", error);
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.statusCode ? error.message : "Could not upload profile picture." });
  }
}

// DELETE /api/profile/picture
export async function deleteProfilePicture(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const publicId = user.profilePicture?.publicId;

    user.profilePicture = null;
    user.avatar = "";
    await user.save();

    if (publicId) {
      try {
        await deleteAsset(publicId, "image");
      } catch (err) {
        console.error(
          "[profile] Failed to delete Cloudinary asset:",
          publicId,
          err.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture removed.",
      data: { profilePicture: null, avatar: "" },
    });
  } catch (error) {
    console.error("Error in deleteProfilePicture controller:", error);
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.statusCode ? error.message : "Could not remove profile picture." });
  }
}
