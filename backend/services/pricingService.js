const PricingSettings = require('../models/PricingSettings');
const { DEFAULT_PRICING } = require('../config/constants');

let cachedPricing = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Retrieves the global dynamic duty pricing settings (with in-memory TTL caching).
 */
async function getPricingSettings() {
  const now = Date.now();
  if (cachedPricing && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedPricing;
  }

  let doc = await PricingSettings.findOne({ key: 'global_pricing' }).lean();
  if (!doc) {
    doc = await PricingSettings.create({ key: 'global_pricing', ...DEFAULT_PRICING });
    cachedPricing = doc.toObject ? doc.toObject() : doc;
    lastFetchTime = now;
    return cachedPricing;
  }

  cachedPricing = doc;
  lastFetchTime = now;
  return cachedPricing;
}

/**
 * Updates dynamic pricing settings (Admin action) and invalidates cache immediately.
 */
async function updatePricingSettings(updateData) {
  const updated = await PricingSettings.findOneAndUpdate(
    { key: 'global_pricing' },
    { $set: updateData },
    { returnDocument: 'after', upsert: true, runValidators: true }
  ).lean();

  cachedPricing = updated;
  lastFetchTime = Date.now();
  return updated;
}

module.exports = {
  getPricingSettings,
  updatePricingSettings,
};
