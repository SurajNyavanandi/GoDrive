const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    driverId: {
      type: String,
      required: [true, 'Driver ID is required'],
      index: true,
    },
    pickupAddress: {
      type: String,
      trim: true,
      default: '',
    },
    pickupLocation: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Customer',
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer mobile number is required'],
      trim: true,
      index: true,
    },
    totalCost: {
      type: Number,
      min: 0,
    },
    bookingDate: {
      type: String,
    },
    bookingTime: {
      type: String,
    },
    driverType: {
      type: String,
    },
    carType: {
      type: String,
    },
    transmission: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Completed', 'Cancelled', 'In Progress'],
      default: 'Confirmed',
      index: true,
    },
    adAttribution: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Performance compound indexes for customer/driver lookups
bookingSchema.index({ driverId: 1, customerPhone: 1, createdAt: -1 });
bookingSchema.index({ customerPhone: 1, createdAt: -1 });
bookingSchema.index({ driverId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
