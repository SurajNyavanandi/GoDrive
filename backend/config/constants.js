/**
 * Centralized Application Constants
 */

const DEFAULT_PRICING = Object.freeze({
  freelanceSubscriptionPrice: 49,
  permanentSubscriptionPrice: 99,
  combinationSubscriptionPrice: 149,
  cityBaseHours: 4,
  cityBaseFare: 700,
  cityExtraHourlyRate: 100,
  nightSurchargePerHour: 150,
  outstationFlatRate: 2000,
  outstationInterstateRate: 2500,
  monthly4hMinSalary: 20000,
  monthly4hMaxSalary: 25000,
  monthly8hMinSalary: 25000,
  monthly8hMaxSalary: 30000,
  monthly12hMinSalary: 30000,
  monthly12hMaxSalary: 40000,
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

const HYDERABAD_ZONES = Object.freeze([
  {
    name: 'IT / Cyber Corridor & West',
    localities: [
      'Hitec City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Financial District',
      'Nanakramguda', 'Raidurg', 'Manikonda', 'Narsingi', 'Kokapet',
      'Tellapur', 'Nallagandla', 'Chandanagar', 'Hafeezpet', 'Miyapur', 'KPHB Colony'
    ],
  },
  {
    name: 'Central Hyderabad',
    localities: [
      'Banjara Hills', 'Jubilee Hills', 'Somajiguda', 'Panjagutta', 'Ameerpet',
      'Begumpet', 'SR Nagar', 'Khairatabad', 'Lakdikapul', 'Himayatnagar',
      'Narayanguda', 'Abids', 'Koti', 'Basheerbagh'
    ],
  },
  {
    name: 'North & Secunderabad',
    localities: [
      'Secunderabad', 'Marredpally', 'Bowenpally', 'Trimulgherry', 'Alwal',
      'Sainikpuri', 'AS Rao Nagar', 'Kompally', 'Medchal', 'Malkajgiri', 'Jeedimetla'
    ],
  },
  {
    name: 'North-West Belt',
    localities: [
      'Kukatpally', 'KPHB Colony', 'Nizampet', 'Bachupally', 'Miyapur',
      'Pragathi Nagar', 'Moosapet', 'Sanath Nagar', 'Balanagar'
    ],
  },
  {
    name: 'East Hyderabad',
    localities: [
      'Uppal', 'Habsiguda', 'Tarnaka', 'Ramanthapur', 'Boduppal',
      'Peerzadiguda', 'Ghatkesar', 'Nacharam', 'Mallapur', 'ECIL', 'Nagole'
    ],
  },
  {
    name: 'South & Old City',
    localities: [
      'Charminar', 'Falaknuma', 'Chandrayangutta', 'Bahadurpura',
      'Santoshnagar', 'Malakpet', 'Chaderghat', 'Barkas'
    ],
  },
  {
    name: 'South-East & Airport Corridor',
    localities: [
      'Dilsukhnagar', 'LB Nagar', 'Vanasthalipuram', 'Hayathnagar', 'Karmanghat',
      'Saroornagar', 'Kothapet', 'Attapur', 'Rajendranagar', 'Shamshabad', 'Airport (RGIA) / Shamshabad'
    ],
  },
  {
    name: 'South-West Belt',
    localities: [
      'Mehdipatnam', 'Tolichowki', 'Shaikpet', 'Langar Houz', 'Masab Tank', 'Gandipet'
    ],
  },
]);

module.exports = {
  DEFAULT_PRICING,
  PAGINATION,
  HTTP_STATUS,
  HYDERABAD_ZONES,
};
