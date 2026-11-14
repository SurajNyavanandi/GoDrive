/**
 * Data Formatters & Normalization Helpers
 */

/**
 * Normalizes an Indian mobile number into consistent +91XXXXXXXXXX format.
 * @param {string|number} phone
 * @returns {string}
 */
function normalizeMobile(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? `+91${digits}` : (digits ? `+91${digits}` : '');
}

/**
 * Strips all non-digit characters from a phone number string.
 * @param {string|number} phone
 * @returns {string}
 */
function cleanPhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '');
}

/**
 * Strips non-digits from an Aadhaar number.
 * @param {string|number} aadhaar
 * @returns {string}
 */
function normalizeAadhaar(aadhaar) {
  if (!aadhaar) return '';
  return String(aadhaar).replace(/\D/g, '');
}

/**
 * Formats a 12-digit Aadhaar number as XXXX-XXXX-XXXX.
 * @param {string|number} aadhaar
 * @returns {string}
 */
function formatAadhaar(aadhaar) {
  const clean = normalizeAadhaar(aadhaar);
  if (clean.length === 12) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
  }
  return aadhaar || '';
}

/**
 * Normalizes a driving license string to uppercase alphanumeric characters.
 * @param {string} license
 * @returns {string}
 */
function normalizeLicense(license) {
  if (!license) return '';
  return String(license).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Computes remaining days from an ISO date string or Date object.
 * @param {Date|string} expiryIso
 * @returns {number}
 */
function computeRemainingDays(expiryIso) {
  if (!expiryIso) return 0;
  const expiryTime = new Date(expiryIso).getTime();
  if (isNaN(expiryTime)) return 0;
  const now = Date.now();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

module.exports = {
  normalizeMobile,
  cleanPhone,
  normalizeAadhaar,
  formatAadhaar,
  normalizeLicense,
  computeRemainingDays,
};
