/**
 * Association & Admin Configurable Driver Fixed Pricing Parameters
 */

// 1. Temporary / City Duties (In-City & Round Trip)
// Allowed Booking Hours: ONLY 4, 6, and 8 hours
// Base Fare: ₹700 for first 4 hours
// Additional Hours: ₹100 per extra hour (6 hrs = ₹900, 8 hrs = ₹1,100)
// Operating timeframe: 6:00 AM to 10:00 PM
// Night Surcharge: ₹150 / hour for hours past 10:00 PM
export const ALLOWED_CITY_BOOKING_HOURS = [4, 6, 8];

export function calculateCityFare({ hours = 4, isNightDuty = false, nightHours = 0, pricing = {} } = {}) {
  const p = pricing || {};
  const baseHours = Number(p.cityBaseHours) || 4;
  const baseFare = Number(p.cityBaseFare) || 700;
  const extraHourlyRate = Number(p.cityExtraHourlyRate) || 100;
  const nightRate = Number(p.nightSurchargePerHour) || 150;

  // Enforce 4, 6, or 8 hours
  const selectedHours = ALLOWED_CITY_BOOKING_HOURS.includes(Number(hours))
    ? Number(hours)
    : Number(hours) >= 8
    ? 8
    : Number(hours) >= 6
    ? 6
    : 4;

  const extraHours = Math.max(0, selectedHours - baseHours);
  const extraHoursFare = extraHours * extraHourlyRate;
  
  const numNightHours = isNightDuty ? Math.max(1, Number(nightHours) || 1) : 0;
  const nightSurchargeFare = numNightHours * nightRate;
  
  const totalCost = baseFare + extraHoursFare + nightSurchargeFare;
  
  return {
    hours: selectedHours,
    baseFare,
    baseHours,
    extraHours,
    extraHoursFare,
    numNightHours,
    nightSurchargeFare,
    totalCost,
    ruleNotice: `Standard City Fare: ₹${baseFare} for 4 hrs, ₹900 for 6 hrs, ₹1,100 for 8 hrs (+ ₹${nightRate}/hr night surcharge after 10 PM).`,
  };
}

// 2. Outstation Duties (Distance/200km restriction removed per customer request)
// Single Day Outstation: Flat ₹2,000 + food expenses
// Traveling to other states / Multi-day: ₹2,500 per day + food & room accommodation (sleeping in car strictly prohibited)
export function calculateOutstationFare({ days = 1, isInterstate = false, pricing = {} } = {}) {
  const p = pricing || {};
  const flatRate = Number(p.outstationFlatRate) || 2000;
  const interstateRate = Number(p.outstationInterstateRate) || 2500;

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
    ruleNotice: `Single Day Outstation Duty: Flat ₹${flatRate.toLocaleString('en-IN')}. Driver food expenses covered by customer.`,
  };
}

// 3. Permanent / Monthly Duties
// Monthly salaries in ranges:
// 4 hours -> ₹20,000 – ₹25,000 (Negotiable)
// 8 hours -> ₹25,000 – ₹30,000 (Negotiable)
// 12 hours -> ₹30,000 – ₹40,000 (Negotiable)
export function getMonthlyTiers(pricing = {}) {
  const p = pricing || {};
  const min4h = Number(p.monthly4hMinSalary) || 20000;
  const max4h = Number(p.monthly4hMaxSalary) || 25000;

  const min8h = Number(p.monthly8hMinSalary) || 25000;
  const max8h = Number(p.monthly8hMaxSalary) || 30000;

  const min12h = Number(p.monthly12hMinSalary) || 30000;
  const max12h = Number(p.monthly12hMaxSalary) || 40000;

  return [
    {
      id: 'tier_4h',
      hoursPerDay: 4,
      salaryMin: min4h,
      salaryMax: max4h,
      salaryRange: `₹${min4h.toLocaleString('en-IN')} – ₹${max4h.toLocaleString('en-IN')}`,
      salaryRangeText: `₹${min4h.toLocaleString('en-IN')} – ₹${max4h.toLocaleString('en-IN')} (Negotiable)`,
      monthlySalary: min4h,
      label: '4 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${min4h.toLocaleString('en-IN')} – ₹${max4h.toLocaleString('en-IN')} / month (Negotiable) · 4 hours daily part-time/school pickup duty.`,
    },
    {
      id: 'tier_8h',
      hoursPerDay: 8,
      salaryMin: min8h,
      salaryMax: max8h,
      salaryRange: `₹${min8h.toLocaleString('en-IN')} – ₹${max8h.toLocaleString('en-IN')}`,
      salaryRangeText: `₹${min8h.toLocaleString('en-IN')} – ₹${max8h.toLocaleString('en-IN')} (Negotiable)`,
      monthlySalary: min8h,
      label: '8 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${min8h.toLocaleString('en-IN')} – ₹${max8h.toLocaleString('en-IN')} / month (Negotiable) · 8 hours daily standard family/executive duty.`,
    },
    {
      id: 'tier_12h',
      hoursPerDay: 12,
      salaryMin: min12h,
      salaryMax: max12h,
      salaryRange: `₹${min12h.toLocaleString('en-IN')} – ₹${max12h.toLocaleString('en-IN')}`,
      salaryRangeText: `₹${min12h.toLocaleString('en-IN')} – ₹${max12h.toLocaleString('en-IN')} (Negotiable)`,
      monthlySalary: min12h,
      label: '12 Hours / Day',
      schedule: '6 Days / Week (1 Mandated Weekly Off)',
      description: `₹${min12h.toLocaleString('en-IN')} – ₹${max12h.toLocaleString('en-IN')} / month (Negotiable) · 12 hours daily full duty executive chauffeur.`,
    },
  ];
}

export const MONTHLY_DUTY_TIERS = getMonthlyTiers();

export function getMonthlyTier(hoursPerDay = 8, pricing = {}) {
  const tiers = getMonthlyTiers(pricing || {});
  const h = Number(hoursPerDay);
  if (h <= 4) return tiers[0];
  if (h <= 8) return tiers[1];
  return tiers[2];
}
