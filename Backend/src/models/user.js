const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Core user information
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  
  // User type and basic info
  role: { type: String, enum: ['hire', 'job_seeker'], required: true },
  location: { type: String },
  profilePhoto: { type: String },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  quotaUsed: { type: Number, default: 0 },
  
  // Basic salary info (kept here for quick access)
  salaryAmount: { type: String },
  salaryCurrency: { type: String, default: 'USD' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);