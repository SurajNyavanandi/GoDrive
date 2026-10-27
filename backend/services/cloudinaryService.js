let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch {
  cloudinary = null;
}

const env = require('../config/env');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudinary &&
  cloudName &&
  apiKey &&
  apiSecret &&
  !cloudName.startsWith('xxx') &&
  !apiKey.startsWith('xxx')
);

if (isConfigured && cloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload a file buffer to Cloudinary with safe fallback to Base64 data URL
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} mimetype - File mime type
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<{ url: string, simulated: boolean, publicId?: string }>}
 */
const uploadDocument = async (buffer, mimetype, folder = 'mana-drivers/kyc') => {
  if (!buffer) {
    throw new Error('No file buffer provided for upload');
  }

  // Safe fallback if Cloudinary is not configured in environment
  if (!isConfigured) {
    console.log('[Cloudinary Sandbox] Credentials not configured in .env — using local data URL fallback');
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimetype || 'image/jpeg'};base64,${base64Data}`;
    return {
      url: dataUrl,
      simulated: true,
      message: 'Document stored as sandbox data URL (Cloudinary offline)',
    };
  }

  // Upload stream to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.warn('[Cloudinary Upload Error] Falling back to data URL:', error.message);
          // Fallback on transient error
          const base64Data = buffer.toString('base64');
          return resolve({
            url: `data:${mimetype || 'image/jpeg'};base64,${base64Data}`,
            simulated: true,
            error: error.message,
          });
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          simulated: false,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadDocument,
  isConfigured,
};
