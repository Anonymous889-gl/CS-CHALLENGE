const express = require('express');
const { submitApplication, getApplicationReview, getApplicationById } = require('../controllers/application.controller');
const upload = require('../middlewars/upload.middleware');
const { protect } = require('../middlewars/protect');

const router = express.Router();

router.post('/submit', protect, upload, submitApplication);
router.get('/:id/review', protect, getApplicationReview);
router.get('/:id', protect, getApplicationById);

module.exports = router;
