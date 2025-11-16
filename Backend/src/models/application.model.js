const mongoose = require('mongoose');

/**
 * Mongoose schema for a job application.
 * This stores references to the file and the data extracted/generated.
 */
const applicationSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required.'],
    },
    candidateEmail: {
      type: String,
      required: [true, 'Candidate email is required.'],
    },
    jobId: {
      type: String, // In a real app, this would be: type: mongoose.Schema.Types.ObjectId, ref: 'Job'
      required: [true, 'Job ID is required.'],
    },
    // Stores the server path to the uploaded resume file
    resumeFilepath: {
      type: String,
      required: true,
    },
    // Stores the structured JSON from the parser API
    parsedResumeData: {
      type: Object,
      default: null,
    },
    // Stores the JSON review from the (mocked) AI LLM service
    aiReviewData: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending_review', 'under_review', 'reviewed', 'rejected'],
      default: 'pending_review',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
