const express = require('express');
const { protect } = require('../middlewars/protect');
const User = require('../models/user');
const Profile = require('../models/profile');
const UserMetrics = require('../models/userMetrics');
const Activity = require('../models/activity');

const router = express.Router();

// GET /api/profile - Get user profile with all related data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
      ...user.toObject(),
      // Profile data
      skills: profile?.skills || '',
      interests: profile?.interests || '',
      industries: profile?.industries || '',
      desiredJobs: profile?.desiredJobs || '',
      preferredLocations: profile?.preferredLocations || '',
      careerInterests: profile?.careerInterests || '',
      salaryAmount: (user.salaryAmount ?? profile?.salaryExpectation ?? 0),
      salaryCurrency: user.salaryCurrency ?? profile?.salaryCurrency ?? 'USD',
      photoVisibility: profile?.photoVisibility || 'public',
      isProfileComplete: profile?.isProfileComplete || false,
      completedSteps: profile?.completedSteps || 1,
      // Metrics data
      resumeScore: metrics?.resumeScore || 0,
      interviewScore: metrics?.interviewScore || 0,
      jobMatches: metrics?.jobMatches || 0,
      applications: metrics?.applicationsSubmitted || 0,
      footprintScore: metrics?.footprintScore || 0,
      // Activity data
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        type: activity.type,
        time: activity.createdAt.toISOString()
      }))
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', protect, async (req, res) => {
  try {
    const {
      name,
      surname,
      location,
      salaryAmount,
      salaryCurrency,
      skills,
      interests,
      industries,
      photoVisibility
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (location) user.location = location;
    if (salaryAmount) user.salaryAmount = salaryAmount;
    if (salaryCurrency) user.salaryCurrency = salaryCurrency;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;
    if (industries) user.industries = industries;
    if (photoVisibility) user.photoVisibility = photoVisibility;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/profile/complete - Complete user profile with skills, interests, etc.
router.put('/complete', protect, async (req, res) => {
  try {
    const {
      skills,
      desiredJobs,
      industries,
      preferredLocations,
      careerInterests,
      salaryExpectation,
      salaryCurrency,
      isProfileComplete,
      completedSteps
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create profile
    const profileData = {
      userId: req.user._id,
      skills,
      desiredJobs,
      industries,
      preferredLocations,
      careerInterests,
      salaryExpectation,
      isProfileComplete: isProfileComplete !== undefined ? isProfileComplete : true,
      completedSteps: completedSteps || 4
    };

    await Profile.findOneAndUpdate(
      { userId: req.user._id },
      profileData,
      { upsert: true, new: true }
    );

    // Update user's salary currency if provided
    if (salaryCurrency) {
      user.salaryCurrency = salaryCurrency;
      await user.save();
    }

    // Create or update user metrics
    await UserMetrics.findOneAndUpdate(
      { userId: req.user._id },
      { 
        userId: req.user._id,
        lastProfileUpdate: new Date()
      },
      { upsert: true, new: true }
    );

    // Log activity
    await Activity.create({
      userId: req.user._id,
      action: 'Completed profile setup',
      type: 'profile',
      description: 'User completed their profile with skills, interests, and preferences'
    });

    // Return success response
    res.json({ message: 'Profile completed successfully' });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// PUT /api/profile/update-metrics - Update user metrics (resume score, interview score, etc.)
router.put('/update-metrics', protect, async (req, res) => {
  try {
    const {
      resumeScore,
      interviewScore,
      interviewType,
      difficulty,
      questionsAnswered,
      totalQuestions,
      jobMatches,
      applications,
      footprintScore
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create user metrics
    const updateData = { userId: req.user._id };
    
    if (resumeScore !== undefined) updateData.resumeScore = resumeScore;
    if (interviewScore !== undefined) updateData.interviewScore = interviewScore;
    if (jobMatches !== undefined) updateData.jobMatches = jobMatches;
    if (applications !== undefined) updateData.applicationsSubmitted = applications;
    if (footprintScore !== undefined) updateData.footprintScore = footprintScore;
    
    const metrics = await UserMetrics.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { upsert: true, new: true }
    );

    // Log activity based on what was updated
    let activityAction = '';
    let activityType = '';
    let activityDescription = '';
    
    if (resumeScore !== undefined) {
      activityAction = `Resume analyzed - Score: ${resumeScore}/100`;
      activityType = 'resume';
      activityDescription = `Resume analysis completed with score of ${resumeScore}%`;
    } else if (interviewScore !== undefined) {
      activityAction = `${interviewType} interview completed - Score: ${interviewScore}/100`;
      activityType = 'interview';
      activityDescription = `${interviewType} interview (${difficulty}) completed: ${questionsAnswered}/${totalQuestions} questions answered, score: ${interviewScore}%`;
    } else if (jobMatches !== undefined) {
      activityAction = `Job matching updated - ${jobMatches} matches found`;
      activityType = 'job';
      activityDescription = `Job matching algorithm found ${jobMatches} potential matches`;
    } else if (applications !== undefined) {
      activityAction = `Application submitted - Total: ${applications}`;
      activityType = 'job';
      activityDescription = `User submitted a job application, total applications: ${applications}`;
    } else if (footprintScore !== undefined) {
      activityAction = `Digital footprint analyzed - Score: ${footprintScore}/100`;
      activityType = 'footprint';
      activityDescription = `Digital footprint analysis completed with score of ${footprintScore}%`;
    }

    if (activityAction) {
      await Activity.create({
        userId: req.user._id,
        action: activityAction,
        type: activityType,
        description: activityDescription,
        metadata: {
          score: resumeScore || interviewScore || footprintScore,
          interviewType,
          difficulty,
          questionsAnswered,
          totalQuestions,
          jobMatches,
          applications
        }
      });
    }

    res.json({ 
      message: 'Metrics updated successfully',
      metrics: metrics
    });
  } catch (error) {
    console.error('Metrics update error:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

module.exports = router;
