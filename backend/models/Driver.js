const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    rawPhone: {
      type: String,
      trim: true,
      index: true,
    },
    driverType: {
      type: String,
      enum: ['freelance', 'permanent', 'combined'],
      default: 'freelance',
      index: true,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      default: 175,
    },
    monthlySalary: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      default: 'Hyderabad',
      trim: true,
      index: true,
    },
    experience: {
      type: Number,
      min: 0,
      default: 1,
    },
    languages: {
      type: String,
      default: 'Telugu, Hindi',
    },
    photo: {
      type: String,
    },
    licensePhoto: {
      type: String,
    },
    aadhaarPhoto: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    licenseNo: {
      type: String,
      trim: true,
      index: true,
    },
    aadhaarNo: {
      type: String,
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5.0,
    },
    trips: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Offline', 'Blocked'],
      default: 'Available',
      index: true,
    },
    subscriptionPlan: {
      type: String,
      default: 'free_trial',
    },
    subscriptionExpiry: {
      type: Date,
    },
    remainingDays: {
      type: Number,
      default: 90,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewOtp: {
      type: String,
      default: '4821',
      select: false,
    },
    listingStatus: {
      type: String,
      default: 'Pending Verification',
    },
    rejectionReason: {
      type: String,
    },
    blockReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.reviewOtp;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.reviewOtp;
        return ret;
      },
    },
  }
);

// Performance compound indexes
driverSchema.index({ isApproved: 1, status: 1, rating: -1, trips: -1 });
driverSchema.index({ isApproved: 1, status: 1 });
driverSchema.index({ driverType: 1, isApproved: 1 });
driverSchema.index({ isApproved: 1, location: 1 });
driverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Driver', driverSchema);
