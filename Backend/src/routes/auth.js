const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const multer = require('multer');
const passport = require('passport'); // Add if not
const { protect } = require('../middlewars/protect');

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images!'), false);
    cb(null, true);
  }
});

// Signup with upload + error handle
router.post('/signup', (req, res, next) => {
  upload.single('profilePhoto')(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, signup);
//validator
const { body } = require('express-validator');
router.post('/signup', 
  upload.single('profilePhoto'),
   [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short')
 ], signup);

// Login
router.post('/login', login);

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Gen token + redirect frontend
  const token = generateToken(req.user._id, req.user.role);
  res.redirect(`http://localhost:3000?token=${token}`);
});


router.get('/me', protect, async (req, res) => {
  try {
    const Profile = require('../models/profile');
    const UserMetrics = require('../models/userMetrics');
    const Activity = require('../models/activity');

    // Get profile data
    const profile = await Profile.findOne({ userId: req.user._id });
    
    // Get metrics data
    const metrics = await UserMetrics.findOne({ userId: req.user._id });
    
    // Get recent activities (last 10)
    const recentActivity = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action type description createdAt');

    // Combine all data
    const userData = {
      ...req.user.toObject(),
      // Profile data
      skills: profile?.skills || '',
      interests: profile?.interests || '',
      industries: profile?.industries || '',
      experience: profile?.experience || 'entry',
      desiredJobs: profile?.desiredJobs || '',
      preferredLocations: profile?.preferredLocations || '',
      careerInterests: profile?.careerInterests || '',
      salaryAmount: (req.user.salaryAmount ?? profile?.salaryExpectation ?? 0),
      salaryCurrency: req.user.salaryCurrency ?? profile?.salaryCurrency ?? 'USD',
      photoVisibility: profile?.photoVisibility || 'public',
      isProfileComplete: profile?.isProfileComplete || false,
      completedSteps: profile?.completedSteps || 1,
      // Metrics data
      resumeScore: metrics?.resumeScore || 0,
      interviewScore: metrics?.interviewScore || 0,
      jobMatches: metrics?.jobMatches || 0,
      footprintScore: metrics?.footprintScore || 0,
      // Activity data
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        type: activity.type,
        time: activity.createdAt.toISOString()
      })),
      quotaUsed: req.user.quotaUsed
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Auth me error:', error);
    res.json({ user: req.user, quotaUsed: req.user.quotaUsed });
  }
});
module.exports = router;