const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    driverId: {
      type: String,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    quote: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    verifiedByOtp: {
      type: Boolean,
      default: false,
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

reviewSchema.index({ driverId: 1, rating: -1 });
reviewSchema.index({ driverId: 1, createdAt: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
