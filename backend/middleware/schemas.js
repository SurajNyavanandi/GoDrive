const { z } = require('zod');

// Auth Schemas
const authRegisterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    mobile: z.string().optional(),
  })
  .strict();

const authLoginSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

// OTP Schemas
const otpSendSchema = z
  .object({
    mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
    templateId: z.string().optional(),
    otp: z.string().optional(),
    otpExpiry: z.coerce.number().optional(),
  })
  .strict();

const otpRetrySchema = z
  .object({
    mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
    retryType: z.enum(['text', 'voice']).optional(),
  })
  .strict();

const otpVerifySchema = z
  .object({
    mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
    otp: z.string().min(4, 'OTP must be 4 to 6 digits').max(6),
  })
  .strict();

// Payment Schemas
const paymentOrderSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    currency: z.string().default('INR'),
    receipt: z.string().optional(),
    notes: z.record(z.any()).optional(),
  })
  .strict();

const paymentVerifySchema = z
  .object({
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
    razorpay_signature: z.string().optional(),
  })
  .strict();

// Booking Schemas
const bookingCreateSchema = z
  .object({
    driverId: z.string().min(1, 'Driver ID is required'),
    pickupAddress: z.string().optional(),
    pickupLocation: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    totalCost: z.coerce.number().min(0).max(200000).optional(),
    bookingDate: z.string().optional(),
    bookingTime: z.string().optional(),
    driverType: z.string().optional(),
    duration: z.any().optional(),
    carType: z.string().optional(),
    transmission: z.string().optional(),
    status: z.string().optional(),
  })
  .strict();

const bookingQuerySchema = z
  .object({
    phone: z.string().optional(),
    driverId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });

// Driver Schemas
const driverLoginSchema = z
  .object({
    phone: z.string().min(10, 'Mobile number is required'),
    otp: z.string().optional(),
  })
  .strict();

const driverRegisterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    phone: z.string().min(10, 'Valid mobile number required'),
    licenseNo: z.string().min(5, 'Valid driving license required').max(30),
    aadhaarNo: z.string().min(12, '12-digit Aadhaar required').max(20),
    driverType: z.string().optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    monthlySalary: z.coerce.number().min(0).optional(),
    location: z.string().optional(),
    experience: z.coerce.number().min(0).optional(),
    languages: z.string().optional(),
    photo: z.string().optional(),
    licensePhoto: z.string().optional(),
    aadhaarPhoto: z.string().optional(),
    bio: z.string().optional(),
  })
  .strict();

const driverProfileUpdateSchema = z
  .object({
    name: z.string().max(100).optional(),
    phone: z.string().optional(),
    driverType: z.string().optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    monthlySalary: z.coerce.number().min(0).optional(),
    location: z.string().optional(),
    experience: z.coerce.number().min(0).optional(),
    languages: z.string().optional(),
    photo: z.string().optional(),
    licensePhoto: z.string().optional(),
    aadhaarPhoto: z.string().optional(),
    bio: z.string().optional(),
    licenseNo: z.string().optional(),
    aadhaarNo: z.string().optional(),
    status: z.string().optional(),
    subscriptionPlan: z.string().optional(),
  })
  .strict();

const driverStatusSchema = z
  .object({
    status: z.enum(['Available', 'Busy', 'Offline', 'Blocked']),
  })
  .strict();

const driverSubscribeSchema = z
  .object({
    plan: z.string().min(1),
  })
  .strict();

const driverReviewSchema = z
  .object({
    author: z.string().min(1, 'Author is required'),
    rating: z.coerce.number().min(1).max(5),
    title: z.string().min(1, 'Title is required'),
    quote: z.string().min(1, 'Review quote is required'),
    driverId: z.string().optional(),
    otp: z.string().optional(),
  })
  .strict();

const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    driverId: z.string().optional(),
  });

// Admin Schemas
const adminSubscriptionSchema = z
  .object({
    days: z.coerce.number().int().min(1).max(365).default(30),
  })
  .strict();

const adminReasonSchema = z
  .object({
    reason: z.string().optional(),
  })
  .strict();

const adminPricingSchema = z
  .object({
    freelanceSubscriptionPrice: z.coerce.number().optional(),
    permanentSubscriptionPrice: z.coerce.number().optional(),
    combinationSubscriptionPrice: z.coerce.number().optional(),
    cityBaseHours: z.coerce.number().optional(),
    cityBaseFare: z.coerce.number().optional(),
    cityExtraHourlyRate: z.coerce.number().optional(),
    nightSurchargePerHour: z.coerce.number().optional(),
    outstationFlatRate: z.coerce.number().optional(),
    outstationInterstateRate: z.coerce.number().optional(),
    monthly4hMinSalary: z.coerce.number().optional(),
    monthly4hMaxSalary: z.coerce.number().optional(),
    monthly8hMinSalary: z.coerce.number().optional(),
    monthly8hMaxSalary: z.coerce.number().optional(),
    monthly12hMinSalary: z.coerce.number().optional(),
    monthly12hMaxSalary: z.coerce.number().optional(),
  })
  .strict();

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  otpSendSchema,
  otpRetrySchema,
  otpVerifySchema,
  paymentOrderSchema,
  paymentVerifySchema,
  bookingCreateSchema,
  bookingQuerySchema,
  driverLoginSchema,
  driverRegisterSchema,
  driverProfileUpdateSchema,
  driverStatusSchema,
  driverSubscribeSchema,
  driverReviewSchema,
  paginationQuerySchema,
  adminSubscriptionSchema,
  adminReasonSchema,
  adminPricingSchema,
};
