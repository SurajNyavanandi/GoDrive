/**
 * Transparent Direct Driver Fixed Pricing Parameters
 */

// 1. Temporary / City Duties (In-City & Round Trip)
// Base Fare: ₹700 for first 4 hours
// Additional Hours: ₹100 per extra hour
// Operating timeframe: 6:00 AM to 10:00 PM
// Night Surcharge: ₹150 / hour for hours past 10:00 PM
export function calculateCityFare({ hours = 4, isNightDuty = false, nightHours = 0 }) {
  const baseHours = 4;
  const baseFare = 700;
  const numHours = Math.max(1, Number(hours) || 4);
  
  const extraHours = Math.max(0, numHours - baseHours);
  const extraHoursFare = extraHours * 100;
  
  const numNightHours = isNightDuty ? Math.max(1, Number(nightHours) || 1) : 0;
  const nightSurchargeFare = numNightHours * 150;
  
  const totalCost = baseFare + extraHoursFare + nightSurchargeFare;
  
  return {
    baseFare,
    baseHours,
    extraHours,
    extraHoursFare,
    numNightHours,
    nightSurchargeFare,
    totalCost,
    ruleNotice: 'Standard City Fare: ₹700 for 4 hrs + ₹100/extra hr (+ ₹150/hr night surcharge after 10 PM).',
  };
}

// 2. Outstation Duties
// Up to 200 km: Flat ₹2,000 (Customer must arrange food expenses)
// Beyond 200 km (single day): ₹2,000 + ₹10/km for additional km
// Traveling to other states / Multi-day: ₹2,500 per day (Customer must arrange food & room accommodation; sleeping in car strictly prohibited)
export function calculateOutstationFare({ distanceKm = 150, days = 1, isInterstate = false }) {
  const numDays = Math.max(1, Number(days) || 1);
  const numKm = Math.max(1, Number(distanceKm) || 150);
  
  if (isInterstate || numDays > 1) {
    const totalCost = numDays * 2500;
    return {
      type: 'interstate',
      numDays,
      ratePerDay: 2500,
      totalCost,
      foodRequirement: 'Customer must provide driver food expenses',
      roomRequirement: 'Customer must provide driver room accommodation (sleeping in cars is strictly prohibited)',
      ruleNotice: `Interstate / Multi-day Outstation: ₹2,500 / day (${numDays} days). Food & room accommodation mandatory.`,
    };
  }
  
  // Single day outstation up to 200 km or beyond 200 km
  const extraKm = Math.max(0, numKm - 200);
  const extraKmCharge = extraKm * 10;
  const totalCost = 2000 + extraKmCharge;

  return {
    type: 'standard_outstation',
    baseKm: 200,
    distanceKm: numKm,
    extraKm,
    extraKmCharge,
    totalCost,
    foodRequirement: 'Customer must provide driver food expenses',
    roomRequirement: 'Mandatory if overnight stay is required (sleeping in car strictly prohibited)',
    ruleNotice: extraKm > 0
      ? `Outstation Duty: ₹2,000 (up to 200 km) + ₹${extraKmCharge} (${extraKm} extra km @ ₹10/km). Food expenses covered by customer.`
      : 'Outstation Duty (up to 200 km): Flat ₹2,000. Driver food expenses covered by customer.',
  };
}

// 3. Permanent / Monthly Duties
// Hardcoded Subscription Tiers:
// - 8 Hours/Day: ₹25,000 / month
// - 10 Hours/Day: ₹28,000 / month
// - 12 Hours/Day: ₹30,000 / month
// All tiers include 1 mandated day off per week (6 working days/wk).
// Overtime / Extended Tiers (₹35,000 - ₹40,000 / month): Flagged for Admin-Customer mutual agreement.
export const MONTHLY_DUTY_TIERS = [
  {
    id: 'tier_8h',
    hoursPerDay: 8,
    monthlySalary: 25000,
    label: '8 Hours / Day',
    schedule: '6 Days / Week (1 Mandated Weekly Off)',
    description: '₹25,000 / month · 8 hours daily family/executive duty.',
  },
  {
    id: 'tier_10h',
    hoursPerDay: 10,
    monthlySalary: 28000,
    label: '10 Hours / Day',
    schedule: '6 Days / Week (1 Mandated Weekly Off)',
    description: '₹28,000 / month · 10 hours daily executive duty.',
  },
  {
    id: 'tier_12h',
    hoursPerDay: 12,
    monthlySalary: 30000,
    label: '12 Hours / Day',
    schedule: '6 Days / Week (1 Mandated Weekly Off)',
    description: '₹30,000 / month · 12 hours daily full duty.',
  },
  {
    id: 'tier_extended',
    hoursPerDay: 14,
    monthlySalary: 35000,
    label: 'Extended Duty (Overtime)',
    schedule: 'Flexible / 24x7 Shift',
    description: '₹35,000 – ₹40,000 / month · Requires Admin-Customer mutual negotiation.',
    requiresNegotiation: true,
  },
];

export function getMonthlyTier(hoursPerDay = 8) {
  const h = Number(hoursPerDay);
  if (h <= 8) return MONTHLY_DUTY_TIERS[0];
  if (h <= 10) return MONTHLY_DUTY_TIERS[1];
  if (h <= 12) return MONTHLY_DUTY_TIERS[2];
  return MONTHLY_DUTY_TIERS[3];
}
