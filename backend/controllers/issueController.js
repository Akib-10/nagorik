const Issue = require('../models/Issue');

// GET /api/issues — public feed
// সবাই খালি চোখে issue list দেখতে পারবে (login লাগবে না)
exports.getIssues = async (req, res) => {
  try {
    // newest report আগে দেখাবে — createdAt দিয়ে sort
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/issues/mine — শুধু নিজেরটা
// logged-in user-এর নিজের report list ফেরত দেয়
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/issues — নতুন report তৈরি
// frontend থেকে আসা সব field (title, area, photos...) DB-তে সেভ হয়
exports.createIssue = async (req, res) => {
  try {
    // user id-token থেকে protect middleware set করে দেয়
    const issue = await Issue.create({ ...req.body, user: req.user._id });
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

// PUT /api/issues/:id — report edit/update
// মালিক ছাড়া কেউ এডিট করতে পারবে না (ownership check)
exports.updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Not found' });
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    Object.assign(issue, req.body);
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};

// DELETE /api/issues/:id — report মুছে ফেলা
// শুধু মালিক delete করতে পারবে
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Not found' });
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await issue.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};