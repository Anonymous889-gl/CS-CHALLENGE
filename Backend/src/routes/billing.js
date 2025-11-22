const express = require('express');
const { protect } = require('../middlewars/protect');
const UserMetrics = require('../models/userMetrics');

const router = express.Router();

// helper: credits by plan
const PLAN_CREDITS = {
  free: 250,
  premium: 1500,
  pro: -1 // unlimited
};

// POST /api/billing/select-plan  { plan: 'free' | 'premium' | 'pro' }
router.post('/select-plan', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'premium', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const credits = PLAN_CREDITS[plan];

    const updated = await UserMetrics.findOneAndUpdate(
      { userId: req.user._id },
      {
        plan,
        creditsBalance: credits,
        lastTopUp: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Plan selected', plan: updated.plan, creditsBalance: updated.creditsBalance });
  } catch (err) {
    console.error('select-plan error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/billing/charge { amount: 20 }
router.post('/charge', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const metrics = await UserMetrics.findOne({ userId: req.user._id });
    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    // pro plan unlimited
    if (metrics.plan === 'pro') {
      return res.json({ creditsBalance: -1 });
    }

    if (metrics.creditsBalance < amount) {
      return res.status(402).json({ error: 'Insufficient credits', creditsBalance: metrics.creditsBalance });
    }

    metrics.creditsBalance -= amount;
    await metrics.save();

    res.json({ creditsBalance: metrics.creditsBalance });
  } catch (err) {
    console.error('charge error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
