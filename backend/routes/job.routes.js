const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/job.controller');
const { protect, recruiterOnly } = require('../middleware/auth.middleware');

router.route('/')
  .get(getJobs)
  .post(protect, recruiterOnly, createJob);

module.exports = router;
