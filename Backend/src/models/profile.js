const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  // Basic profile info
  skills: { type: String },
  interests: { type: String },
  industries: { type: String },
  experience: { type: String, enum: ['entry', 'junior', 'mid', 'senior', 'lead'], default: 'entry' },
  
  // Job preferences
  desiredJobs: { type: String },
  preferredLocations: { type: String },
  careerInterests: { type: String },
  
  // Salary information
  salaryExpectation: { type: Number },
  salaryCurrency: { type: String, default: 'USD' },
  
  // Profile completion status
  isProfileComplete: { type: Boolean, default: false },
  completedSteps: { type: Number, default: 1 },
  
  // Profile visibility
  photoVisibility: { type: String, default: 'public' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Profile', profileSchema);
