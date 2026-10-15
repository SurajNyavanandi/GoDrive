import logger from './logger';

const API_BASE = '/api';

export async function fetchPublicDrivers() {
  try {
    const res = await fetch(`${API_BASE}/drivers`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    logger.error('Failed to fetch drivers from backend', err);
    return [];
  }
}

export async function loginDriverApi(phone, otp) {
  const res = await fetch(`${API_BASE}/drivers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  return await res.json();
}

export async function registerDriverApi(data) {
  const res = await fetch(`${API_BASE}/drivers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function uploadDriverDocsApi(formData) {
  const res = await fetch(`${API_BASE}/drivers/upload-docs`, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}


export async function updateDriverStatusApi(driverId, status) {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return await res.json();
}

export async function sendOtpApi(mobile) {
  const res = await fetch(`${API_BASE}/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  });
  return await res.json();
}

export async function verifyOtpApi(mobile, otp) {
  const res = await fetch(`${API_BASE}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });
  return await res.json();
}

export async function createBookingApi(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  return await res.json();
}

export async function fetchAdminDriversApi() {
  const res = await fetch(`${API_BASE}/admin/drivers`);
  return await res.json();
}

export async function approveDriverApi(id) {
  const res = await fetch(`${API_BASE}/admin/drivers/${id}/approve`, {
    method: 'PUT',
  });
  return await res.json();
}

export async function rejectDriverApi(id) {
  const res = await fetch(`${API_BASE}/admin/drivers/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
}

export async function fetchAdminBookingsApi() {
  const res = await fetch(`${API_BASE}/admin/bookings`);
  return await res.json();
}
