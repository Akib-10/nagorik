const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getIssues,
  getMyIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');

router.get('/', getIssues);                       // public — feed-এর জন্য (login লাগে না)
router.get('/mine', protect, getMyIssues);        // নিজের report list — login দরকার
router.post('/', protect, createIssue);           // নতুন report submit — login দরকার
router.put('/:id', protect, updateIssue);         // edit report — শুধু মালিক
router.delete('/:id', protect, deleteIssue);      // delete report — শুধু মালিক

module.exports = router;