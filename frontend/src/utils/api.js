import logger from './logger';

export function getApiUrl(path) {
  let base = (
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_BACKEND_API_URL ||
    import.meta.env?.BACKEND_API_URL ||
    ''
  ).trim();

  // Strip trailing slashes and trailing /api instances from base URL
  while (base.endsWith('/')) base = base.slice(0, -1);
  while (base.endsWith('/api')) base = base.slice(0, -4);
  while (base.endsWith('/')) base = base.slice(0, -1);

  // Clean path: strip leading /api if present to obtain relative route path
  let clean = path ? String(path).trim() : '';
  if (!clean.startsWith('/')) clean = `/${clean}`;
  while (clean.startsWith('/api/') || clean === '/api') {
    if (clean === '/api') {
      clean = '';
      break;
    } else {
      clean = clean.slice(4);
    }
  }

  const finalPath = `/api${clean.startsWith('/') ? clean : `/${clean}`}`;
  return base ? `${base}${finalPath}` : finalPath;
}

export function getAdminHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('mana_admin_token') ||
      localStorage.getItem('vt_auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('godrive_admin_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const adminKey =
      localStorage.getItem('vt_admin_key') ||
      localStorage.getItem('admin_key') ||
      localStorage.getItem('godrive_admin_key') ||
      import.meta.env?.VITE_ADMIN_KEY ||
      import.meta.env?.VITE_ADMIN_API_KEY;
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }
  }
  return headers;
}

/**
 * Safely parse JSON responses to prevent "Unexpected end of JSON input" crashes
 * on empty bodies or HTML error pages.
 */
export async function safeParseJson(res, defaultMessage = 'Unexpected response from server') {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        success: false,
        status: res?.status || 500,
        code: res?.status === 404 ? 'NOT_FOUND' : 'EMPTY_RESPONSE',
        message:
          res?.status === 404
            ? 'API service endpoint not found (404). Ensure backend server is active.'
            : defaultMessage,
      };
    }
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: res?.status || 500,
      code: 'INVALID_JSON',
      message: res?.status === 404 ? 'API route not found (404)' : defaultMessage,
    };
  }
}

// ---------------------------------------------------------------------------
// PUBLIC DRIVERS
// ---------------------------------------------------------------------------
export async function fetchPublicDrivers() {
  try {
    const res = await fetch(getApiUrl('/api/drivers'));
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
    return [];
  } catch (err) {
    logger.warn('Failed to fetch public drivers from API:', err?.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// DRIVER AUTHENTICATION & PORTAL
// ---------------------------------------------------------------------------
export async function loginDriverApi(phone, otp) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    return await safeParseJson(res, 'Driver login failed. Please check your credentials.');
  } catch (err) {
    logger.error('Driver login network error:', err);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to driver portal. Please check your connection.',
    };
  }
}

export async function registerDriverApi(data) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await safeParseJson(res, 'Driver registration failed. Please try again.');
  } catch (err) {
    logger.error('Driver registration network error:', err);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error registering driver profile. Please try again.',
    };
  }
}

export async function updateDriverProfileApi(driverId, profileData) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/profile`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(profileData),
    });
    return await safeParseJson(res, 'Profile update failed.');
  } catch (err) {
    logger.error('Update driver profile network error:', err);
    return {
      success: false,
      message: 'Network error updating profile. Please try again.',
    };
  }
}

export const updateDriverSelfProfileApi = updateDriverProfileApi;

export async function updateDriverStatusApi(driverId, status) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/status`), {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    return await safeParseJson(res, 'Status update failed.');
  } catch (err) {
    logger.error('Update driver status network error:', err);
    return { success: false, message: 'Network error updating status.' };
  }
}

export async function subscribeDriverApi(driverId, plan, paymentDetails = {}) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/subscribe`), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ plan, paymentDetails }),
    });
    return await safeParseJson(res, 'Subscription update failed.');
  } catch (err) {
    logger.error('Driver subscription network error:', err);
    return {
      success: false,
      message: 'Network error processing subscription. Please contact support.',
    };
  }
}

export const subscribeDriverPlanApi = subscribeDriverApi;

export async function uploadDriverDocsApi(formData) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/upload-docs'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: formData,
    });
    return await safeParseJson(res, 'Document upload failed.');
  } catch (err) {
    logger.error('Driver docs upload network error:', err);
    return {
      success: false,
      message: 'Network error uploading documents. Please try again.',
    };
  }
}

// ---------------------------------------------------------------------------
// BOOKINGS
// ---------------------------------------------------------------------------
export async function createBookingApi(bookingData) {
  try {
    const res = await fetch(getApiUrl('/api/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return await safeParseJson(res, 'Booking submission failed.');
  } catch (err) {
    logger.error('Booking network error:', err);
    return {
      success: false,
      message: 'Network error submitting booking. Please try again.',
    };
  }
}

// ---------------------------------------------------------------------------
// ADMIN APIS
// ---------------------------------------------------------------------------
export async function fetchAdminDriversApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers'), {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && Array.isArray(json.data)) {
        return json;
      }
    }
    return { success: false, data: [] };
  } catch (err) {
    logger.warn('Failed to fetch admin drivers:', err?.message);
    return { success: false, data: [] };
  }
}

export async function createDriverApi(driverData) {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(driverData),
    });
    return await safeParseJson(res, 'Driver creation failed.');
  } catch (err) {
    logger.error('Create driver network error:', err);
    return {
      success: false,
      message: 'Network error creating driver. Please try again.',
    };
  }
}

export async function updateDriverApi(driverId, driverData) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(driverData),
    });
    return await safeParseJson(res, 'Driver update failed.');
  } catch (err) {
    logger.error('Update driver network error:', err);
    return {
      success: false,
      message: 'Network error updating driver. Please try again.',
    };
  }
}

export async function deleteDriverApi(driverId) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}`), {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return await safeParseJson(res, 'Driver deletion failed.');
  } catch (err) {
    logger.error('Delete driver network error:', err);
    return { success: false, message: 'Network error deleting driver.' };
  }
}

export async function extendSubscriptionApi(driverId, days = 30) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}/subscription`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ days }),
    });
    return await safeParseJson(res, 'Subscription extension failed.');
  } catch (err) {
    logger.error('Extend subscription network error:', err);
    return { success: false, message: 'Network error extending subscription.' };
  }
}

export async function approveDriverApi(id) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/approve`), {
      method: 'PUT',
      headers: getAdminHeaders(),
    });
    return await safeParseJson(res, 'Driver approval failed.');
  } catch (err) {
    logger.error('Approve driver network error:', err);
    return { success: false, message: 'Network error approving driver.' };
  }
}

export async function rejectDriverApi(id, reason) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/reject`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await safeParseJson(res, 'Driver rejection failed.');
  } catch (err) {
    logger.error('Reject driver network error:', err);
    return { success: false, message: 'Network error rejecting driver.' };
  }
}

export async function blockDriverApi(id, reason) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/block`), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await safeParseJson(res, 'Driver blocking failed.');
  } catch (err) {
    logger.error('Block driver network error:', err);
    return { success: false, message: 'Network error blocking driver.' };
  }
}

export async function unblockDriverApi(id) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/unblock`), {
      method: 'PUT',
      headers: getAdminHeaders(),
    });
    return await safeParseJson(res, 'Driver unblocking failed.');
  } catch (err) {
    logger.error('Unblock driver network error:', err);
    return { success: false, message: 'Network error unblocking driver.' };
  }
}

export async function restoreDriverApi(driverSnapshot) {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers/restore'), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ driver: driverSnapshot }),
    });
    return await safeParseJson(res, 'Driver restoration failed.');
  } catch (err) {
    logger.error('Restore driver network error:', err);
    return { success: false, message: 'Network error restoring driver.' };
  }
}

export async function fetchAdminHistoryApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/history'), {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && Array.isArray(json.data)) return json.data;
    }
    return [];
  } catch (err) {
    logger.warn('Failed to fetch admin history:', err?.message);
    return [];
  }
}

export async function fetchPricingSettingsApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/pricing'), {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && json.data) return json.data;
    }
    return null;
  } catch (err) {
    logger.warn('Failed to fetch pricing settings:', err?.message);
    return null;
  }
}

export async function updatePricingSettingsApi(settingsData) {
  try {
    const res = await fetch(getApiUrl('/api/admin/pricing'), {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settingsData),
    });
    return await safeParseJson(res, 'Pricing update failed.');
  } catch (err) {
    logger.error('Update pricing settings network error:', err);
    return { success: false, message: 'Network error updating pricing settings.' };
  }
}

export async function fetchReviewsApi(driverId) {
  try {
    const path = driverId ? `/api/drivers/reviews?driverId=${encodeURIComponent(driverId)}` : '/api/drivers/reviews';
    const res = await fetch(getApiUrl(path));
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && Array.isArray(json.data)) return json.data;
    }
    return [];
  } catch (err) {
    logger.warn('Failed to fetch reviews:', err?.message);
    return [];
  }
}

export async function submitReviewApi(reviewData) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return await safeParseJson(res, 'Review submission failed.');
  } catch (err) {
    logger.error('Submit review network error:', err);
    return { success: false, message: 'Network error submitting review.' };
  }
}

export async function fetchAdminBookingsApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/bookings'), {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const json = await safeParseJson(res);
      if (json.success && Array.isArray(json.data)) return json;
    }
    return { success: false, data: [] };
  } catch (err) {
    logger.warn('Failed to fetch admin bookings:', err?.message);
    return { success: false, data: [] };
  }
}

// ---------------------------------------------------------------------------
// ADMIN AUTHENTICATION
// ---------------------------------------------------------------------------
export async function adminLoginApi({ email, password }) {
  try {
    const res = await fetch(getApiUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await safeParseJson(res, 'Admin login failed.');
  } catch (err) {
    logger.error('Admin login network error:', err);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error connecting to login service.',
    };
  }
}

export async function requestAdminPasswordSetupApi(email) {
  try {
    const res = await fetch(getApiUrl('/api/admin/request-password-setup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await safeParseJson(res, 'Password setup request failed.');
  } catch (err) {
    logger.error('Admin password setup request network error:', err);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error requesting password setup code.',
    };
  }
}

export async function setAdminPasswordApi({ email, token, password }) {
  try {
    const res = await fetch(getApiUrl('/api/admin/set-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password }),
    });
    return await safeParseJson(res, 'Configuring password failed.');
  } catch (err) {
    logger.error('Admin set password network error:', err);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Network error configuring password.',
    };
  }
}
