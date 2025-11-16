const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Activity details
  action: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['profile', 'job', 'interview', 'resume', 'footprint', 'login', 'application']
  },
  
  // Additional context
  description: { type: String },
  metadata: {
    jobId: { type: String },
    companyName: { type: String },
    jobTitle: { type: String },
    score: { type: Number },
    other: { type: mongoose.Schema.Types.Mixed }
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
