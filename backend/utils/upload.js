const multer = require('multer');
const path = require('path');

// Memory storage for direct buffer processing or cloud upload streaming
const storage = multer.memoryStorage();

// Allowed MIME types and extensions (disallowing dangerous SVG to prevent Stored XSS)
const allowedExtensions = /^\.(jpe?g|png|webp|pdf)$/i;
const allowedMimetypes = /^(image\/(jpeg|png|webp)|application\/pdf)$/i;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedExtensions.test(ext);
  const isValidMime = allowedMimetypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    return cb(null, true);
  }

  cb(new Error('Only valid images (JPEG, PNG, WebP) and PDF documents under 5 MB are allowed.'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3, // Maximum 3 files per request (aadhaar, license, photo)
  },
  fileFilter,
});

/**
 * Validates actual file magic byte signatures on the buffer
 * to prevent extension spoofing (e.g. php/html renamed to .png)
 * @param {Buffer} buffer
 * @returns {boolean}
 */
const validateFileSignature = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  // PDF: 25 50 44 46 (%PDF)
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  // WebP: RIFF ... WEBP
  const isWebp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  return isJpeg || isPng || isPdf || isWebp;
};

module.exports = upload;
module.exports.validateFileSignature = validateFileSignature;
