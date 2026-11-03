/**
 * Association & Admin Configurable Driver Fixed Pricing Parameters
 */

// 1. Temporary / City Duties (In-City & Round Trip)
// Base Fare: ₹700 for first 4 hours
// Additional Hours: ₹100 per extra hour
// Operating timeframe: 6:00 AM to 10:00 PM
// Night Surcharge: ₹150 / hour for hours past 10:00 PM
export function calculateCityFare({ hours = 4, isNightDuty = false, nightHours = 0, pricing = {} }) {
  const baseHours = Number(pricing.cityBaseHours) || 4;
  const baseFare = Number(pricing.cityBaseFare) || 700;
  const extraHourlyRate = Number(pricing.cityExtraHourlyRate) || 100;
  const nightRate = Number(pricing.nightSurchargePerHour) || 150;

  const numHours = Math.max(1, Number(hours) || 4);
  const extraHours = Math.max(0, numHours - baseHours);
  const extraHoursFare = extraHours * extraHourlyRate;
  
  const numNightHours = isNightDuty ? Math.max(1, Number(nightHours) || 1) : 0;
  const nightSurchargeFare = numNightHours * nightRate;
  
  const totalCost = baseFare + extraHoursFare + nightSurchargeFare;
  
  return {
    baseFare,
    baseHours,
    extraHours,
    extraHoursFare,
    numNightHours,
    nightSurchargeFare,
    totalCost,
    ruleNotice: `Standard City Fare: ₹${baseFare} for first 4 hrs + ₹${extraHourlyRate}/extra hr (+ ₹${nightRate}/hr night surcharge after 10 PM).`,
  };
}

// 2. Outstation Duties (Distance estimation removed per requirement 4)
// Up to 200 km / Single Day: Flat ₹2,000 + food expenses
// Traveling to other states / Multi-day: ₹2,500 per day + food & room accommodation (sleeping in car strictly prohibited)
export function calculateOutstationFare({ days = 1, isInterstate = false, pricing = {} }) {
  const flatRate = Number(pricing.outstationFlatRate) || 2000;
  const interstateRate = Number(pricing.outstationInterstateRate) || 2500;

  const numDays = Math.max(1, Number(days) || 1);
  
  if (isInterstate || numDays > 1) {
    const totalCost = numDays * interstateRate;
    return {
      type: 'interstate',
      numDays,
      ratePerDay: interstateRate,
      totalCost,
      foodRequirement: 'Customer must provide driver food expenses',
      roomRequirement: 'Customer must provide driver room accommodation (sleeping in cars is strictly prohibited)',
      ruleNotice: `Interstate / Multi-day Outstation: ₹${interstateRate.toLocaleString('en-IN')} / day (${numDays} day${numDays > 1 ? 's' : ''}). Food & room accommodation mandatory.`,
    };
  }
  
  return {
    type: 'standard_outstation',
    numDays: 1,
    totalCost: flatRate,
    foodRequirement: 'Customer must provide driver food expenses',
    roomRequirement: 'Mandatory if overnight stay is required (sleeping in car strictly prohibited)',
    ruleNotice: `Outstation Duty (up to 200 km): Flat ₹${flatRate.toLocaleString('en-IN')}. Driver food expenses covered by customer.`,
  };
}

// 3. Permanent / Monthly Duties
export function getMonthlyTiers(pricing = {}) {
  const salary8h = Number(pricing.monthly8hSalary) || 25000;
  const salary10h = Number(pricing.monthly10hSalary) || 28000;
  const salary12h = Number(pricing.monthly12hSalary) || 30000;

  return [
    {
      id: 'tier_8h',
      hoursPerDay: 8,
      monthlySalary: salary8h,
      label: '8 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${salary8h.toLocaleString('en-IN')} / month · 8 hours daily family/executive duty.`,
    },
    {
      id: 'tier_10h',
      hoursPerDay: 10,
      monthlySalary: salary10h,
      label: '10 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${salary10h.toLocaleString('en-IN')} / month · 10 hours daily executive duty.`,
    },
    {
      id: 'tier_12h',
      hoursPerDay: 12,
      monthlySalary: salary12h,
      label: '12 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${salary12h.toLocaleString('en-IN')} / month · 12 hours daily full duty.`,
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
}

export const MONTHLY_DUTY_TIERS = getMonthlyTiers();

export function getMonthlyTier(hoursPerDay = 8, pricing = {}) {
  const tiers = getMonthlyTiers(pricing);
  const h = Number(hoursPerDay);
  if (h <= 8) return tiers[0];
  if (h <= 10) return tiers[1];
  if (h <= 12) return tiers[2];
  return tiers[3];
}
