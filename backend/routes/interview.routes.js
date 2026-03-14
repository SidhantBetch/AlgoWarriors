const express = require('express');
const router = express.Router();
const { startInterview, submitInterview } = require('../controllers/interview.controller');
const { protect, candidateOnly } = require('../middleware/auth.middleware');

router.get('/start/:jobId', protect, candidateOnly, startInterview);
router.post('/submit/:interviewId', protect, candidateOnly, submitInterview);

module.exports = router;
