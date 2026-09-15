const Issue = require("../models/Issue");

// GET /api/issues — public feed
// sobai issue list dekhte parbe (login lagbe na)
exports.getIssues = async (req, res) => {
  try {
    // newest report age — createdAt diye sort
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/issues/mine — Nijer ta
// logged-in user er nijer report list ferot dey
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/issues — new report make korar jonno
// frontend theke field (title, area, photos...) DB- te save hoy
exports.createIssue = async (req, res) => {
  try {
    // user id-token theke protect middleware set kore dey
    const issue = await Issue.create({ ...req.body, user: req.user._id });
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// PUT /api/issues/:id — report edit/update
//  onno keo edit korte parbe na(ownership check)
exports.updateIssue = async (req, res) => {
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
};

// DELETE /api/issues/:id — report delete
// shudu owner delete korte parbe
exports.deleteIssue = async (req, res) => {
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
};
