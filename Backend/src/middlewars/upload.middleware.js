const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * This generates a unique, random filename (like 0b5d4e7f...) for each upload.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a 16-byte random hex string
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      // Get the file extension (e.g., ".pdf")
      const extension = path.extname(file.originalname);
      // Create the new filename (e.g., "0b5d4e7f12d...A.pdf")
      const uniqueFilename = buf.toString('hex') + extension;
      cb(null, uniqueFilename);
    });
  },
});

/**
 * Multer file filter to accept only common resume formats.
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error(
      'File upload error: Only PDF, DOC, and DOCX formats are allowed.'
    )
  );
};

// Configure and export the multer middleware
const upload = multer({
  storage: storage,
  limits: {
    // 5MB file size limit
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// We export the middleware to be used on a single file upload
// The field name in the form-data should be 'resume'
module.exports = upload.single('resume');
