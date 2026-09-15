const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getIssues,
  getMyIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

router.get("/", getIssues); // public
router.get("/mine", protect, getMyIssues); 
router.post("/", protect, createIssue); 
router.put("/:id", protect, updateIssue); 
router.delete("/:id", protect, deleteIssue); 

module.exports = router;
