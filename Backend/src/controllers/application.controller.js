const Application = require('../models/application.model.js');
const resumeService = require('../services/resume.service.js');
const fs = require('fs');

/**
 * Controller for submitting a new application.
 * Orchestrates the entire workflow.
 */
exports.submitApplication = async (req, res) => {
  try {
    // 1. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    // 2. Get other data from the form body
    const { candidateName, candidateEmail, jobId, jobDescription } = req.body;
    if (!candidateName || !candidateEmail || !jobId || !jobDescription) {
      // Clean up the uploaded file if other data is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message:
          'Missing required fields: candidateName, candidateEmail, jobId, and jobDescription.',
      });
    }

    // --- Workflow Steps ---

    // 3. (Mock) Send file to Resume Parser API
    console.log(`Parsing resume: ${req.file.path}`);
    const parsedData = await resumeService.parseResume(req.file.path);

    // 4. (Mock) Send parsed data + JD to AI Review Service (the part your friend is building)
    console.log('Getting (mock) AI review...');
    const aiReview = await resumeService.getAiReview(parsedData, jobDescription);

    // 5. Store all data in the database
    console.log('Saving application to database...');
    const newApplication = new Application({
      candidateName,
      candidateEmail,
      jobId,
      resumeFilepath: req.file.path, // Store the path to the saved file
      parsedResumeData: parsedData, // Store the JSON from the parser
      aiReviewData: aiReview, // Store the JSON from the (mock) AI service
      status: 'reviewed', // Update status
    });

    await newApplication.save();

    // 6. Send the created application data back to the client
    res.status(201).json({
      message: 'Application submitted and reviewed successfully!',
      application: newApplication,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    // If an error occurs, try to delete the uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    res
      .status(500)
      .json({ message: 'Server error during application submission.' });
  }
};

/**
 * Controller to fetch the review data for the Recruiter UI.
 */
exports.getApplicationReview = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).select(
      'parsedResumeData aiReviewData'
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // 7. Send the specific review data to the client (Recruiter UI)
    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application review:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Controller to get a single application by its ID.
 */
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};
