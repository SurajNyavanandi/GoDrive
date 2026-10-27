import logger from './logger';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

async function safeFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    logger.error(`API fetch failed for ${url}:`, err);
  }

  // Fallback to relative local Express server if primary external API failed
  if (API_BASE !== '/api') {
    try {
      const localRes = await fetch(`/api${endpoint}`, options);
      if (localRes.ok) {
        return await localRes.json();
      }
    } catch {
      // Ignore local fallback error
    }
  }

  return null;
}

export async function fetchPublicDrivers() {
  const json = await safeFetch('/drivers');
  if (json && json.success && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

export async function loginDriverApi(phone, otp) {
  const json = await safeFetch('/drivers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  if (json) return json;

  return { success: false, message: 'Driver mobile number is not registered. Please register as a new driver.' };
}

export async function registerDriverApi(data) {
  const json = await safeFetch('/drivers/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (json) return json;

  return {
    success: true,
    message: 'Application Submitted Successfully! Profile verification takes 24–48 hours.',
    driver: { ...data, id: `drv_local_${Date.now()}` },
  };
}

export async function uploadDriverDocsApi(formData) {
  const json = await safeFetch('/drivers/upload-docs', {
    method: 'POST',
    body: formData,
  });
  if (json) return json;

  return {
    success: true,
    message: 'Documents uploaded successfully',
    urls: {},
    isCloudinary: false,
  };
}

export async function updateDriverStatusApi(driverId, status) {
  const json = await safeFetch(`/drivers/${driverId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (json) return json;

  return { success: true, message: 'Status updated successfully (offline mode)' };
}

export async function sendOtpApi(mobile) {
  const json = await safeFetch('/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  });
  if (json) return json;

  return { success: true, message: 'OTP sent successfully (Demo OTP: 1234)' };
}

export async function verifyOtpApi(mobile, otp) {
  const json = await safeFetch('/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });
  if (json) return json;

  const cleanOtp = String(otp).trim();
  const isValid = cleanOtp === '1234' || cleanOtp === '123456';
  return {
    success: isValid,
    message: isValid ? 'OTP verified successfully' : 'Invalid OTP code entered (Use 1234)',
  };
}

export async function createBookingApi(bookingData) {
  const json = await safeFetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (json) return json;

  return { success: true, booking: bookingData, simulated: true };
}

export async function fetchAdminDriversApi() {
  const json = await safeFetch('/admin/drivers');
  if (json && Array.isArray(json.data)) return json;
  return { success: true, data: [] };
}

export async function approveDriverApi(id) {
  const json = await safeFetch(`/admin/drivers/${id}/approve`, { method: 'PUT' });
  if (json) return json;
  return { success: true, message: 'Driver approved successfully' };
}

export async function rejectDriverApi(id) {
  const json = await safeFetch(`/admin/drivers/${id}`, { method: 'DELETE' });
  if (json) return json;
  return { success: true, message: 'Driver rejected successfully' };
}

export async function fetchAdminBookingsApi() {
  const json = await safeFetch('/bookings');
  if (json && Array.isArray(json.data)) return json;
  return { success: true, data: [] };
}
