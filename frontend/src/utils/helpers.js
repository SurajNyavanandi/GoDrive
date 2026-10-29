import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Robust Tailwind CSS class names combiner
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date into a clean editorial string
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a duration in seconds to a human-readable string
 * @param {number} seconds
 * @returns {string}
 */
export function formatUptime(seconds) {
  if (!seconds || seconds < 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Copies text to clipboard with fallback
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Indian Mobile Number Validator (10 digits starting with 6-9, non-repetitive)
 */
export function validateIndianMobile(phone) {
  const clean = String(phone || '').replace(/\D/g, '');
  if (!clean) {
    return { isValid: false, error: 'Mobile number is required', cleaned: '' };
  }
  if (clean.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits', cleaned: clean };
  }
  if (!/^[6-9]/.test(clean)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9', cleaned: clean };
  }
  // Check for repetitive fake numbers like 9999999999 or 8888888888
  if (/^(\d)\1{9}$/.test(clean)) {
    return { isValid: false, error: 'Please enter a genuine mobile number', cleaned: clean };
  }
  return { isValid: true, cleaned: clean };
}

/**
 * Aadhaar Number Validator (12 digits, cannot start with 0/1, non-repetitive)
 */
export function validateAadhaar(aadhaar) {
  const clean = String(aadhaar || '').replace(/\D/g, '');
  if (!clean) {
    return { isValid: false, error: 'Aadhaar card number is required', cleaned: '' };
  }
  if (clean.length !== 12) {
    return { isValid: false, error: 'Aadhaar number must be exactly 12 digits', cleaned: clean };
  }
  if (/^[01]/.test(clean)) {
    return { isValid: false, error: 'Aadhaar numbers do not start with 0 or 1', cleaned: clean };
  }
  if (/^(\d)\1{11}$/.test(clean)) {
    return { isValid: false, error: 'Invalid Aadhaar number (repetitive digits)', cleaned: clean };
  }
  const formatted = `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
  return { isValid: true, cleaned: clean, formatted };
}

/**
 * Format Aadhaar with auto-hyphens as user types (XXXX-XXXX-XXXX)
 */
export function formatAadhaarInput(val) {
  const clean = String(val || '').replace(/\D/g, '').slice(0, 12);
  const parts = [];
  if (clean.length > 0) parts.push(clean.slice(0, 4));
  if (clean.length > 4) parts.push(clean.slice(4, 8));
  if (clean.length > 8) parts.push(clean.slice(8, 12));
  return parts.join('-');
}

/**
 * Format Driving License with hyphens as user types (e.g. TS-09-2023-0098765)
 */
export function formatDrivingLicenseInput(val) {
  const clean = String(val || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
  if (!clean) return '';
  let formatted = clean.slice(0, 2);
  if (clean.length > 2) formatted += '-' + clean.slice(2, 4);
  if (clean.length > 4) formatted += '-' + clean.slice(4, 8);
  if (clean.length > 8) formatted += '-' + clean.slice(8, 15);
  return formatted;
}

/**
 * Indian Driving License Validator (e.g. TS-09-2023-0098765)
 */
export function validateDrivingLicense(license) {
  const raw = String(license || '').trim().toUpperCase();
  if (!raw) {
    return { isValid: false, error: 'Driving License number is required', cleaned: '' };
  }
  const stripped = raw.replace(/[^A-Z0-9]/g, '');
  if (stripped.length < 10 || stripped.length > 16) {
    return { isValid: false, error: 'Driving License must be 10 to 15 alphanumeric characters (e.g. TS-09-2023-0098765)', cleaned: raw };
  }
  // Must have state code letters and numbers
  const letters = (stripped.match(/[A-Z]/g) || []).length;
  const digits = (stripped.match(/[0-9]/g) || []).length;
  if (letters < 2 || digits < 4) {
    return { isValid: false, error: 'Driving License must include state code (e.g. TS-09-2023-0098765)', cleaned: raw };
  }
  // Reject pure numbers or repetitive strings
  if (/^\d+$/.test(stripped) || /^([A-Z0-9])\1+$/.test(stripped)) {
    return { isValid: false, error: 'Invalid Driving License number format', cleaned: raw };
  }
  const formatted = formatDrivingLicenseInput(stripped);
  return { isValid: true, cleaned: stripped, formatted };
}

/**
 * Driving Experience Validator (1 to 50 years integer)
 */
export function validateExperience(exp) {
  const num = Number(exp);
  if (isNaN(num) || !Number.isInteger(num)) {
    return { isValid: false, error: 'Experience must be a whole number of years', value: 0 };
  }
  if (num < 1) {
    return { isValid: false, error: 'Experience must be at least 1 year', value: num };
  }
  if (num > 50) {
    return { isValid: false, error: 'Experience cannot exceed 50 years', value: num };
  }
  return { isValid: true, value: num };
}

/**
 * Full Name Validator (2-60 characters, must have alphabets)
 */
export function validateName(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required', cleaned: '' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long', cleaned: trimmed };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Name cannot exceed 60 characters', cleaned: trimmed };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Name must contain letters, not only numbers or symbols', cleaned: trimmed };
  }
  return { isValid: true, cleaned: trimmed };
}

/**
 * Pickup Address Validator (5-200 characters)
 */
export function validateAddress(address) {
  const trimmed = String(address || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Pickup address is required', cleaned: '' };
  }
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Please enter a complete pickup address (at least 5 characters)', cleaned: trimmed };
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Pickup address cannot exceed 200 characters', cleaned: trimmed };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Pickup address must contain street or landmark names', cleaned: trimmed };
  }
  return { isValid: true, cleaned: trimmed };
}
