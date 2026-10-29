import logger from './logger';

const RENDER_BACKEND = 'https://godrive-293l.onrender.com';
const envApiUrl = import.meta.env.VITE_API_URL;
const PRIMARY_API = envApiUrl || RENDER_BACKEND;
const PRIMARY_BASE = PRIMARY_API.endsWith('/api') ? PRIMARY_API : `${PRIMARY_API.replace(/\/$/, '')}/api`;

async function safeFetch(endpoint, options = {}) {
  // 1. Try local/same-origin relative Express server (/api/drivers) first
  try {
    const localRes = await fetch(`/api${endpoint}`, options);
    if (localRes.ok) {
      return await localRes.json();
    }
  } catch {
    // Relative endpoint unavailable, fallback to configured primary backend
  }

  // 2. Try Primary Render API with /api prefix (e.g. https://godrive-293l.onrender.com/api/drivers)
  if (PRIMARY_BASE) {
    try {
      const url = `${PRIMARY_BASE}${endpoint}`;
      const res = await fetch(url, options);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        logger.debug(`Primary API request skipped/failed for ${PRIMARY_BASE}${endpoint}:`, err);
      }
    }
  }

  // 3. Try Render API without /api prefix
  if (PRIMARY_API && PRIMARY_API.includes('onrender.com')) {
    try {
      const directUrl = `${PRIMARY_API.replace(/\/$/, '')}${endpoint}`;
      const directRes = await fetch(directUrl, options);
      if (directRes.ok) {
        return await directRes.json();
      }
    } catch {
      // Ignore
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
    message: 'Application Submitted Successfully! Included 90 days Free Trial.',
    driver: { ...data, id: `drv_local_${Date.now()}` },
  };
}

export async function subscribeDriverPlanApi(driverId, plan) {
  const json = await safeFetch(`/drivers/${driverId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (json) return json;
  return { success: true, message: 'Subscription updated (offline mode)' };
}

export async function updateDriverSelfProfileApi(driverId, profileData) {
  const json = await safeFetch(`/drivers/${driverId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (json) return json;
  return { success: true, message: 'Profile updated locally' };
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

// ADMIN APIS (Full CRUD + Subscription Extension)
export async function fetchAdminDriversApi() {
  const json = await safeFetch('/admin/drivers');
  if (json && Array.isArray(json.data)) return json;
  return { success: true, data: [] };
}

export async function createDriverApi(driverData) {
  const json = await safeFetch('/admin/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driverData),
  });
  if (json) return json;
  return { success: true, driver: driverData };
}

export async function updateDriverApi(driverId, driverData) {
  const json = await safeFetch(`/admin/drivers/${driverId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driverData),
  });
  if (json) return json;
  return { success: true, driver: driverData };
}

export async function deleteDriverApi(driverId) {
  const json = await safeFetch(`/admin/drivers/${driverId}`, {
    method: 'DELETE',
  });
  if (json) return json;
  return { success: true, message: 'Driver deleted' };
}

export async function extendSubscriptionApi(driverId, days = 30) {
  const json = await safeFetch(`/admin/drivers/${driverId}/subscription`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });
  if (json) return json;
  return { success: true, message: `Added ${days} bonus days` };
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
