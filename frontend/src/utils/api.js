import { initialDrivers } from '../data/mockDrivers';
import logger from './logger';

export function getApiUrl(path) {
  let base = (
    import.meta.env?.VITE_BACKEND_API_URL ||
    import.meta.env?.BACKEND_API_URL ||
    import.meta.env?.VITE_API_URL ||
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

// IN-MEMORY FALLBACK DATASET (Used if backend endpoint fails)
let memoryDrivers = JSON.parse(JSON.stringify(initialDrivers));
let memoryBookings = [];
let memoryPricing = {
  cityBaseHours: 4,
  cityBaseFare: 700,
  cityExtraHourlyRate: 100,
  nightSurchargePerHour: 150,
  outstationFlatRate: 2000,
  outstationInterstateRate: 2500,
  monthly8hSalary: 25000,
  monthly10hSalary: 28000,
  monthly12hSalary: 30000,
};
let memoryReviews = [];

export async function fetchPublicDrivers() {
  try {
    const res = await fetch(getApiUrl('/api/drivers'));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // fallback
  }
  return memoryDrivers.filter((d) => d.isApproved !== false);
}

export async function loginDriverApi(phone, otp) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const json = await res.json();
    return json;
  } catch {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const driver = memoryDrivers.find(
      (d) => String(d.phone).replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
    );
    if (!driver) {
      return { success: false, code: 'UNREGISTERED', message: 'Mobile number not registered.' };
    }
    if (driver.isApproved === false) {
      if (driver.listingStatus === 'Rejected') {
        return {
          success: false,
          code: 'REJECTED',
          driver,
          message: `Application rejected: ${driver.rejectionReason || 'Incomplete verification'}. You can re-apply after 3 days.`,
        };
      }
      return { success: false, code: 'PENDING_APPROVAL', driver, message: 'Your profile is pending admin approval.' };
    }
    return { success: true, driver, message: 'Login successful (sandbox)' };
  }
}

export async function registerDriverApi(data) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok && json.success) return json;
    if (json.message) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const newDriver = {
    ...data,
    id: `drv-test-${Date.now()}`,
    rating: 5.0,
    trips: 0,
    status: 'Available',
    subscriptionPlan: 'free_trial',
    remainingDays: 90,
    isApproved: false,
    createdAt: new Date().toISOString(),
  };
  memoryDrivers.unshift(newDriver);
  return {
    success: true,
    message: 'Application Submitted Successfully! Included 90 days (3 Months) Free Trial.',
    driver: newDriver,
  };
}

export async function subscribeDriverPlanApi(driverId, plan) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/subscribe`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.subscriptionPlan = plan;
    driver.remainingDays = (driver.remainingDays || 0) + 30;
  }
  return { success: true, message: 'Subscription updated' };
}

export async function updateDriverSelfProfileApi(driverId, profileData) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/profile`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const index = memoryDrivers.findIndex((d) => d.id === driverId);
  if (index !== -1) {
    memoryDrivers[index] = { ...memoryDrivers[index], ...profileData };
    return { success: true, driver: memoryDrivers[index] };
  }
  return { success: false, message: 'Driver not found' };
}

export async function uploadDriverDocsApi(formData) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/upload-docs'), {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  let photoUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D';
  let licensePhotoUrl = null;
  let aadhaarPhotoUrl = null;

  if (formData && typeof formData.get === 'function') {
    const p = formData.get('photo');
    if (p && typeof p === 'string') photoUrl = p;
    const l = formData.get('licensePhoto');
    if (l && typeof l === 'string') licensePhotoUrl = l;
    const a = formData.get('aadhaarPhoto');
    if (a && typeof a === 'string') aadhaarPhotoUrl = a;
  }

  return {
    success: true,
    message: 'Documents uploaded (sandbox mode)',
    urls: {
      licensePhoto: licensePhotoUrl,
      aadhaarPhoto: aadhaarPhotoUrl,
      photo: photoUrl,
    },
  };
}

export async function updateDriverStatusApi(driverId, status) {
  try {
    const res = await fetch(getApiUrl(`/api/drivers/${driverId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.status = status;
    return { success: true, driver };
  }
  return { success: false, message: 'Driver not found' };
}

export async function createBookingApi(bookingData) {
  try {
    const res = await fetch(getApiUrl('/api/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const newBooking = {
    ...bookingData,
    id: `BK-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
  };
  memoryBookings.unshift(newBooking);
  return { success: true, booking: newBooking };
}

// ADMIN APIS
export async function fetchAdminDriversApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers'));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json;
      }
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  return { success: true, data: [...memoryDrivers] };
}

export async function createDriverApi(driverData) {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const newDriver = {
    ...driverData,
    id: `drv-admin-${Date.now()}`,
    rating: 5.0,
    trips: 0,
    isApproved: true,
    remainingDays: 90,
    createdAt: new Date().toISOString(),
  };
  memoryDrivers.unshift(newDriver);
  return { success: true, driver: newDriver };
}

export async function updateDriverApi(driverId, driverData) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const index = memoryDrivers.findIndex((d) => d.id === driverId);
  if (index !== -1) {
    memoryDrivers[index] = { ...memoryDrivers[index], ...driverData };
    return { success: true, driver: memoryDrivers[index] };
  }
  return { success: false, message: 'Driver not found' };
}

export async function deleteDriverApi(driverId) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}`), { method: 'DELETE' });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  memoryDrivers = memoryDrivers.filter((d) => d.id !== driverId);
  return { success: true, message: 'Driver removed' };
}

export async function extendSubscriptionApi(driverId, days = 30) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${driverId}/subscription`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.remainingDays = (driver.remainingDays || 0) + days;
    return { success: true, message: `Added ${days} days` };
  }
  return { success: false, message: 'Driver not found' };
}

export async function approveDriverApi(id) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/approve`), { method: 'PUT' });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === id);
  if (driver) {
    driver.isApproved = true;
    return { success: true, message: 'Driver approved and activated' };
  }
  return { success: false, message: 'Driver not found' };
}

export async function rejectDriverApi(id, reason) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/reject`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === id);
  if (driver) {
    driver.isApproved = false;
    driver.listingStatus = 'Rejected';
    driver.rejectionReason = reason || 'Incomplete details';
    driver.rejectedAt = new Date().toISOString();
    driver.reapplyAllowedAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  return { success: true, message: 'Driver application rejected' };
}

export async function blockDriverApi(id, reason) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/block`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === id);
  if (driver) {
    driver.isApproved = false;
    driver.status = 'Blocked';
    driver.listingStatus = 'Blocked';
    driver.blockReason = reason || 'Blocked due to policy violations';
  }
  return { success: true, message: 'Driver account blocked' };
}

export async function unblockDriverApi(id) {
  try {
    const res = await fetch(getApiUrl(`/api/admin/drivers/${id}/unblock`), {
      method: 'PUT',
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const driver = memoryDrivers.find((d) => d.id === id);
  if (driver) {
    driver.isApproved = true;
    driver.status = 'Available';
    driver.listingStatus = driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver';
    delete driver.blockReason;
  }
  return { success: true, message: 'Driver unblocked' };
}

export async function restoreDriverApi(driverSnapshot) {
  try {
    const res = await fetch(getApiUrl('/api/admin/drivers/restore'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver: driverSnapshot }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  if (driverSnapshot) {
    memoryDrivers.unshift(driverSnapshot);
  }
  return { success: true, message: 'Driver restored' };
}

export async function fetchAdminHistoryApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/history'));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  return [];
}

export async function fetchPricingSettingsApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/pricing'));
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  return memoryPricing;
}

export async function updatePricingSettingsApi(settingsData) {
  try {
    const res = await fetch(getApiUrl('/api/admin/pricing'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    const json = await res.json();
    if (res.ok && json.success) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  memoryPricing = { ...memoryPricing, ...settingsData };
  return { success: true, data: memoryPricing, message: 'Pricing updated in sandbox' };
}

export async function fetchReviewsApi(driverId) {
  try {
    const path = driverId ? `/api/drivers/reviews?driverId=${driverId}` : '/api/drivers/reviews';
    const res = await fetch(getApiUrl(path));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  if (driverId) return memoryReviews.filter((r) => r.driverId === driverId);
  return memoryReviews;
}

export async function submitReviewApi(reviewData) {
  try {
    const res = await fetch(getApiUrl('/api/drivers/reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    const json = await res.json();
    if (res.ok && json.success) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    ...reviewData,
    rating: Number(reviewData.rating) || 5,
    createdAt: new Date().toISOString(),
  };
  memoryReviews.unshift(newReview);
  return { success: true, data: newReview, message: 'Review submitted successfully' };
}

export async function fetchAdminBookingsApi() {
  try {
    const res = await fetch(getApiUrl('/api/admin/bookings'));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json;
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  return { success: true, data: [...memoryBookings] };
}
