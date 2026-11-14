const mongoose = require('mongoose');

const pricingSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_pricing',
      unique: true,
    },
    freelanceSubscriptionPrice: { type: Number, default: 49 },
    permanentSubscriptionPrice: { type: Number, default: 99 },
    combinationSubscriptionPrice: { type: Number, default: 149 },
    cityBaseHours: { type: Number, default: 4 },
    cityBaseFare: { type: Number, default: 700 },
    cityExtraHourlyRate: { type: Number, default: 100 },
    nightSurchargePerHour: { type: Number, default: 150 },
    outstationFlatRate: { type: Number, default: 2000 },
    outstationInterstateRate: { type: Number, default: 2500 },
    monthly4hMinSalary: { type: Number, default: 20000 },
    monthly4hMaxSalary: { type: Number, default: 25000 },
    monthly8hMinSalary: { type: Number, default: 25000 },
    monthly8hMaxSalary: { type: Number, default: 30000 },
    monthly12hMinSalary: { type: Number, default: 30000 },
    monthly12hMaxSalary: { type: Number, default: 40000 },
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

module.exports = mongoose.model('PricingSettings', pricingSettingsSchema);
