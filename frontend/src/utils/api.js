import { initialDrivers } from '../data/mockDrivers';
import logger from './logger';

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
let memoryReviews = [
  {
    id: 'rev-1',
    driverId: 'drv-1',
    driverName: 'Suresh Kumar',
    title: 'Punctual & Very Skilled Fortuner Driver',
    quote: 'Booked Suresh for 6 hours across Hitec City and Jubilee Hills. Very polite and knows all shortcuts. Fixed ₹900 fare was completely transparent.',
    author: 'Vikram Reddy',
    initials: 'VR',
    carAndArea: 'Hitec City · Toyota Fortuner Owner',
    date: 'Today',
    tripType: '6-Hr City Duty',
    rating: 5,
    comment: 'Driver arrived 15 mins early and drove smoothly in heavy traffic.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    driverId: 'drv-2',
    driverName: 'Ramesh Babu',
    title: 'Safe Highway Driving to Srisailam',
    quote: 'Handed over keys for my Kia Seltos for an outstation trip. Maintained safe speed on ghat roads and took good care of my vehicle.',
    author: 'Ananya Rao',
    initials: 'AR',
    carAndArea: 'Gachibowli · Kia Seltos Owner',
    date: 'Yesterday',
    tripType: 'Outstation Duty',
    rating: 5,
    comment: 'Courteous and reliable driver. Will book Ramesh again.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchPublicDrivers() {
  try {
    const res = await fetch('/api/drivers');
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
    const res = await fetch('/api/drivers/login', {
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
    const res = await fetch('/api/drivers/register', {
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
    const res = await fetch(`/api/drivers/${driverId}/subscribe`, {
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
    const res = await fetch(`/api/drivers/${driverId}/profile`, {
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
    const res = await fetch('/api/drivers/upload-docs', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }

  return {
    success: true,
    message: 'Documents uploaded (sandbox mode)',
    urls: {
      licensePhoto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      aadhaarPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  };
}

export async function updateDriverStatusApi(driverId, status) {
  try {
    const res = await fetch(`/api/drivers/${driverId}/status`, {
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
    const res = await fetch('/api/bookings', {
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
    const res = await fetch('/api/admin/drivers');
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
    const res = await fetch('/api/admin/drivers', {
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
    const res = await fetch(`/api/admin/drivers/${driverId}`, {
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
    const res = await fetch(`/api/admin/drivers/${driverId}`, { method: 'DELETE' });
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
    const res = await fetch(`/api/admin/drivers/${driverId}/subscription`, {
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
    const res = await fetch(`/api/admin/drivers/${id}/approve`, { method: 'PUT' });
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
    const res = await fetch(`/api/admin/drivers/${id}/reject`, {
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
    const res = await fetch(`/api/admin/drivers/${id}/block`, {
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

export async function fetchPricingSettingsApi() {
  try {
    const res = await fetch('/api/admin/pricing');
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
    const res = await fetch('/api/admin/pricing', {
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
    const url = driverId ? `/api/drivers/reviews?driverId=${driverId}` : '/api/drivers/reviews';
    const res = await fetch(url);
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
    const res = await fetch('/api/drivers/reviews', {
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
    const res = await fetch('/api/admin/bookings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json;
    }
  } catch (err) {
    logger.warn('API fetch fallback triggered', err?.message);
  }
  return { success: true, data: [...memoryBookings] };
}
