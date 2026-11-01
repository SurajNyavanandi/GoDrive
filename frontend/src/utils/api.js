import { initialDrivers } from '../data/mockDrivers';

// IN-MEMORY TESTING REPOSITORY (Resets completely on page refresh)
let memoryDrivers = JSON.parse(JSON.stringify(initialDrivers));
let memoryBookings = [];

export async function fetchPublicDrivers() {
  // Public roster only returns approved drivers
  return memoryDrivers.filter((d) => d.isApproved !== false);
}

export async function loginDriverApi(phone, otp) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const cleanOtp = String(otp).trim();

  const driver = memoryDrivers.find(
    (d) => String(d.phone).replace(/\D/g, '').endsWith(cleanPhone.slice(-10))
  );

  if (!driver) {
    return {
      success: false,
      code: 'UNREGISTERED',
      message: 'Mobile number not registered. Please register as a driver.',
    };
  }

  if (driver.isApproved === false) {
    return {
      success: false,
      code: 'PENDING_APPROVAL',
      driver,
      message: 'Your profile is pending admin approval.',
    };
  }

  // Any 4+ digit OTP passes in testing mode
  if (cleanOtp.length >= 4) {
    return {
      success: true,
      driver,
      message: 'Login successful',
    };
  }

  return {
    success: false,
    message: 'Invalid OTP. Enter any 4-digit code (e.g., 1234).',
  };
}

export async function registerDriverApi(data) {
  const newDriver = {
    ...data,
    id: `drv-test-${Date.now()}`,
    rating: 5.0,
    trips: 0,
    status: 'Available',
    subscriptionPlan: 'free_trial',
    remainingDays: 90,
    isApproved: false, // requires admin approval
    createdAt: new Date().toISOString(),
  };

  memoryDrivers.unshift(newDriver);

  return {
    success: true,
    message: 'Application Submitted Successfully! Included 90 days Free Trial.',
    driver: newDriver,
  };
}

export async function subscribeDriverPlanApi(driverId, plan) {
  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.subscriptionPlan = plan;
    driver.remainingDays = (driver.remainingDays || 0) + (plan === 'featured' ? 60 : 30);
  }
  return { success: true, message: 'Subscription updated in testing mode' };
}

export async function updateDriverSelfProfileApi(driverId, profileData) {
  const index = memoryDrivers.findIndex((d) => d.id === driverId);
  if (index !== -1) {
    memoryDrivers[index] = { ...memoryDrivers[index], ...profileData };
    return { success: true, driver: memoryDrivers[index] };
  }
  return { success: false, message: 'Driver not found' };
}

export async function uploadDriverDocsApi() {
  return {
    success: true,
    message: 'Documents uploaded (testing mode)',
    urls: {
      licensePhoto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      aadhaarPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    isCloudinary: false,
  };
}

export async function updateDriverStatusApi(driverId, status) {
  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.status = status;
    return { success: true, driver };
  }
  return { success: false, message: 'Driver not found' };
}

export async function sendOtpApi() {
  return { success: true, message: 'OTP sent (Demo OTP: 1234)' };
}

export async function verifyOtpApi(mobile, otp) {
  const cleanOtp = String(otp).trim();
  const isValid = cleanOtp === '1234' || cleanOtp === '123456' || cleanOtp.length >= 4;
  return {
    success: isValid,
    message: isValid ? 'OTP verified' : 'Invalid OTP. Enter 1234',
  };
}

export async function createBookingApi(bookingData) {
  const newBooking = {
    ...bookingData,
    id: `BK-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
  };
  memoryBookings.unshift(newBooking);
  return { success: true, booking: newBooking };
}

// ADMIN APIS (Full In-Memory CRUD)
export async function fetchAdminDriversApi() {
  return { success: true, data: [...memoryDrivers] };
}

export async function createDriverApi(driverData) {
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
  const index = memoryDrivers.findIndex((d) => d.id === driverId);
  if (index !== -1) {
    memoryDrivers[index] = { ...memoryDrivers[index], ...driverData };
    return { success: true, driver: memoryDrivers[index] };
  }
  return { success: false, message: 'Driver not found' };
}

export async function deleteDriverApi(driverId) {
  memoryDrivers = memoryDrivers.filter((d) => d.id !== driverId);
  return { success: true, message: 'Driver removed from testing array' };
}

export async function extendSubscriptionApi(driverId, days = 30) {
  const driver = memoryDrivers.find((d) => d.id === driverId);
  if (driver) {
    driver.remainingDays = (driver.remainingDays || 0) + days;
    return { success: true, message: `Added ${days} days to driver trial` };
  }
  return { success: false, message: 'Driver not found' };
}

export async function approveDriverApi(id) {
  const driver = memoryDrivers.find((d) => d.id === id);
  if (driver) {
    driver.isApproved = true;
    return { success: true, message: 'Driver approved and activated on homepage' };
  }
  return { success: false, message: 'Driver not found' };
}

export async function rejectDriverApi(id) {
  memoryDrivers = memoryDrivers.filter((d) => d.id !== id);
  return { success: true, message: 'Driver application rejected' };
}

export async function fetchAdminBookingsApi() {
  return { success: true, data: [...memoryBookings] };
}

