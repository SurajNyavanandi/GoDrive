/**
 * Image Validation & Client-side Compression Utility
 * Supports photos up to 5 MB with file size calculations in MB and automatic optimization.
 */

export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Format bytes to MB with 2 decimal places
 * @param {number} bytes
 * @returns {string} e.g. "2.45 MB"
 */
export function formatBytesToMB(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return '0.00 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

/**
 * Validate photo file size and file type
 * @param {File} file
 * @param {number} maxMB
 * @returns {{ valid: boolean, error?: string, sizeMB: string, sizeBytes: number }}
 */
export function validatePhotoFile(file, maxMB = MAX_PHOTO_SIZE_MB) {
  if (!file) {
    return { valid: false, error: 'No file selected', sizeMB: '0.00 MB', sizeBytes: 0 };
  }

  const sizeBytes = file.size;
  const sizeMB = formatBytesToMB(sizeBytes);

  // Validate MIME type
  const isImageMime = file.type && (ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase()) || file.type.startsWith('image/'));
  if (!isImageMime) {
    return {
      valid: false,
      error: `Invalid file type (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP photo.`,
      sizeMB,
      sizeBytes,
    };
  }

  // Validate 5 MB limit
  const maxBytes = maxMB * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    return {
      valid: false,
      error: `Selected photo is ${sizeMB}, which exceeds the ${maxMB} MB limit. Please select an image under 5 MB.`,
      sizeMB,
      sizeBytes,
    };
  }

  return { valid: true, sizeMB, sizeBytes };
}

/**
 * Compress and optimize image using HTML5 Canvas
 * @param {File} file
 * @param {object} options
 * @returns {Promise<{ file: File, dataUrl: string, originalSizeMB: string, compressedSizeMB: string, wasCompressed: boolean }>}
 */
export async function compressPhoto(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = {}) {
  const originalSizeMB = formatBytesToMB(file.size);

  // Skip compression for SVGs, GIFs, or already lightweight images (< 400 KB)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size < 400 * 1024) {
    const dataUrl = await readFileAsDataURL(file);
    return {
      file,
      dataUrl,
      originalSizeMB,
      compressedSizeMB: originalSizeMB,
      wasCompressed: false,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ file, dataUrl: '', originalSizeMB, compressedSizeMB: originalSizeMB, wasCompressed: false });
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({ file, dataUrl: e.target.result, originalSizeMB, compressedSizeMB: originalSizeMB, wasCompressed: false });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale dimensions if they exceed max bounds
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format (prefer WebP if supported, fallback to JPEG)
          const outputType = file.type === 'image/png' ? 'image/jpeg' : (file.type || 'image/jpeg');

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: outputType,
                  lastModified: Date.now(),
                });
                const compressedDataUrl = canvas.toDataURL(outputType, quality);
                resolve({
                  file: compressedFile,
                  dataUrl: compressedDataUrl,
                  originalSizeMB,
                  compressedSizeMB: formatBytesToMB(compressedFile.size),
                  wasCompressed: true,
                });
              } else {
                resolve({
                  file,
                  dataUrl: e.target.result,
                  originalSizeMB,
                  compressedSizeMB: originalSizeMB,
                  wasCompressed: false,
                });
              }
            },
            outputType,
            quality
          );
        } catch {
          resolve({
            file,
            dataUrl: e.target.result,
            originalSizeMB,
            compressedSizeMB: originalSizeMB,
            wasCompressed: false,
          });
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
