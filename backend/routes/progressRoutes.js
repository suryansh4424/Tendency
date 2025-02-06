const express = require('express');
const { getProgress, updateProgress } = require('../controllers/progressController');
const router = express.Router();

router.get('/', getProgress);
router.post('/', updateProgress);

module.exports = router;
