const mongoose = require('mongoose');

const adminHistorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    actionType: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      uppercase: true,
      enum: ['DRIVER', 'PRICING', 'BOOKING', 'SYSTEM', 'USER', 'ADMIN'],
      default: 'DRIVER',
    },
    targetId: {
      type: String,
      default: '',
    },
    targetName: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
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

adminHistorySchema.index({ createdAt: -1 });
adminHistorySchema.index({ actionType: 1, createdAt: -1 });

module.exports = mongoose.model('AdminHistory', adminHistorySchema);
