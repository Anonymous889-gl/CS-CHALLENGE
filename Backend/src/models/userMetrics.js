const mongoose = require('mongoose');

const userMetricsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  // Dashboard metrics
  resumeScore: { type: Number, default: 0 },
  interviewScore: { type: Number, default: 0 },
  jobMatches: { type: Number, default: 0 },
  footprintScore: { type: Number, default: 0 },
  
  // Usage statistics
  profileViews: { type: Number, default: 0 },
  applicationsSubmitted: { type: Number, default: 0 },
  interviewsCompleted: { type: Number, default: 0 },
  
  // Last activity timestamps
  lastLogin: { type: Date },
  lastProfileUpdate: { type: Date },
  lastJobSearch: { type: Date }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('UserMetrics', userMetricsSchema);
