const express = require('express');
const router = express.Router();
const { getResults } = require('../controllers/result.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getResults);

module.exports = router;
