import User from "../models/User.js";

// GET /api/profile
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile controller:", error); // add this
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/profile
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Simple top-level fields
    const editableFields = ["name", "email", "phone", "bio", "avatar"];
    editableFields.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    // Nested sub-documents merge in, rather than overwrite wholesale
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
    console.error("Error in getProfile controller:", error); // add this
    res.status(500).json({ message: "Internal server error" });
  }
}