/**
 * Global Application Constants
 */
export const APP_CONFIG = {
  name: 'Mana Drivers',
  tagline: 'Verified Private Drivers for Your Own Car in Hyderabad',
  apiUrl: import.meta.env?.VITE_API_URL || '/api',
};

export const DRIVER_TYPES = [
  { id: 'all', label: 'All Drivers' },
  { id: 'freelance', label: 'Temporary / City Duty (₹700 for 4 hrs)' },
  { id: 'permanent', label: 'Permanent / Monthly Duty (₹25k – ₹30k/mo)' },
];

export const RAW_HYDERABAD_LOCALITIES = [
  "Abdullapurmet", "Abids", "Addagudur", "Adibatla", "Afzal Gunj", "Ahmadguda", "Airport (RGIA) / Shamshabad", "Alair", "Aliabad", "Ali Samunder", 
  "Alkapur Township", "Alkapuri", "Almasguda", "Alwal", "Amberpet", "Amberpet Sarfekhas", "Ameenpur", "Ameerpet",
  "Amangal", "Ammuguda", "Anandbagh", "Annojiguda", "AS Rao Nagar", "Asif Nagar", "Athmakur", "Attapur", "Auto Nagar", 
  "Aziznagar", "B N Reddy Nagar", "Bacharam", "Bachupally", "Bagh Lingampally", "Bahadurpura", 
  "Bahlookhanguda", "Bakaram", "Bakhtawarguda", "Balapur", "Balanagar", "Balkampet", "Bandlaguda", 
  "Bandlaguda Jagir", "Bandlaguda Kalsa", "Banjara Hills", "Bank Street", "Barkas", "Basheerbagh", "Begum Bazaar", 
  "Begumpet", "Beeramguda", "Bharat Nagar", "Bhagya Nagar Colony", "Bhanur", "Bibinagar", "Bolarum", 
  "Bollaram", "Bollaram Industrial Area", "Bommalaramaram", "Bondilguda", "Boduppal", "Bogaram", 
  "Bowenpally", "Bholakpur", "Bhuvanagiri (Bhongir)", "Burgul", "Budwel", "Chaderghat", "Chanchalguda", 
  "Chandrayangutta", "Chandulal Bowli", "Chandanagar", "Chattanpally", "Chatta Bazaar", "Chaitanyapuri", 
  "Chevella", "Cherlapally", "Chengicherla", "Chikkadpally", "Chilkur", "Chinna Kandukur", "Chitkul", 
  "Chityal", "Choutuppal", "Chowdhariguda", "Chudi Bazaar", "Clock Tower", "Dabilpur", "Daira", 
  "Dammaiguda", "Dandumalkapur", "Dharur", "Deepthisri Nagar", "Dilsukhnagar", "Domalguda", 
  "Drainage Lingampally", "Doulatabad", "Edulabad", "Edulanagulapally", "ECIL", "East Marredpally", 
  "Ellagiri", "Erragadda", "Esamia Bazaar", "Falaknuma", "Farooqnagar", "Fateh Nagar", "Feelkhana", 
  "Ferozguda", "Financial District", "Gachibowli", "Gaddiannaram", "Gagan Mahal", "Gaganpahad", "Gajularamaram", 
  "Gandipet", "Ghatkesar", "Ghansi Bazaar", "Golconda", "Gopanpally", "Gowliguda", "Gowrelli", 
  "Greenlands", "Guddimalkapur", "Gudimalkapur", "Gudur", "Gulmohar Park", "Gundlapochampally", 
  "Gundrampally", "Gundala", "Gurramguda", "Gummadidala", "Hafeezpet", "Habsiguda", "Hakimpet", 
  "Hanwada", "Hasanaliguda", "Hasthinapuram", "Hayathnagar", "Himayat Sagar", "Himayatnagar", "Hitec City",
  "HMT Colony", "Hyderguda", "Hydernagar", "Hydershakote", "IDPL Colony", "Ibrahimpatnam", 
  "Ibrahimbagh", "Injapur", "Inmulnarva", "IS Sadan", "Isnapur", "Jahanuma", "Jadcherla", 
  "Jagadgiri Gutta", "Jalpally", "Janwada", "Jawaharnagar", "Jaya Prakash Narayan Nagar", 
  "Jeedimetla", "Jeedipally", "Jillelguda", "Jinnaram", "JNTU", "Jubilee Hills", "Kachiguda", 
  "Kacharam", "Kadthal", "Kandukur", "Kandlakoya", "Kandikal", "Kandi", "Kanchanbagh", "Kardanur", 
  "Karwan", "Karkhana", "Katedan", "Kapra", "Kallakal", "Kaiwanja", "Keesara", "Keesara Gutta", 
  "Keshampet", "Khairatabad", "Khajaguda", "King Koti", "Kishanbagh", "Kismatpur", "Kokapet", 
  "Kollur", "Kompally", "Kondakal", "Kondapur", "Kondurg", "Kongara Kalan", "Kongara Khurd", 
  "Kothapet", "Kothur", "Kothwalguda", "Koyyalagudem", "KPHB Colony", "Kukatpally", "Kulkacharla", "Kulsumpura", 
  "Kuntloor", "Kurmalguda", "Kushaiguda", "Lakdikapul", "Lalaguda", "Lalithabagh", "Langar Houz", 
  "Lakkaram", "LB Nagar", "Lemoor", "Lingampally", "Madeenaguda (Madinaguda)", "Madhapur", 
  "Madhuban Colony", "Madannapet", "Mahabubnagar", "Maheshwaram", "Mailardevpally", "Macha Bollaram", 
  "Machabolaram", "Mallapur", "Malkajgiri", "Malkajgiri Cantonment", "Malkapur", "Malakpet", 
  "Mallepally", "Mallepalli", "Mamidipally", "Manchal", "Manchirevula", "Mangalpally", "Manikonda", "Mansanpally", 
  "Mansoorabad", "Marpally", "Marredpally", "Masab Tank", "Masjid Banda", "Medak", "Medchal", 
  "Medipally", "Mehdipatnam", "Meerpet", "Meersagar", "Minister Road", "Midjil", "Miyapur", 
  "Miyapur X Roads", "Miyakunta", "Moinabad", "Moghalpura", "Mokila", "Moosapet", "Moosarambagh", 
  "Motakondur", "Moula Ali", "Mothkur", "Mulugu", "Musheerabad", "Mustyalapally", "Mucherla", 
  "Murad Mahal", "Nadergul", "Nagaram", "Nagole", "Nallagandla", "Nampally", "Nanakramguda", "Nandigama", 
  "Narketpally", "Narapally", "Narayanpur", "Narayanguda", "Narsapur", "Narsingi", "Narepally", 
  "Nawabsahebkunta", "Nawabpet", "NCL Colony", "Neknampur", "Neredmet", "New Bowenpally", 
  "New Nallakunta", "NFC Nagar", "NGO's Colony", "Nizampet", "Old Bowenpally", "Old Nallakunta", 
  "Osman Sagar", "Padmarao Nagar", "Pahadishareef", "Panjagutta", "Panama Godowns", "Panthangi", 
  "Pargi", "Paradise", "Patancheru", "Patancheru Industrial Area", "Pathergatti", "Patny", 
  "Pashamylaram", "Peddakaparthy", "Pedda Kandukur", "Pendyal", "Peerzadiguda", "Pet Basheerabad", 
  "Picket", "Pocharam", "Pocharam Industrial Area", "Pochampally", "Proddutur", "Prakash Nagar", 
  "Pragathi Enclave", "Pragathi Nagar", "Prashanth Nagar", "Puppalaguda", "Putlibowli", "Quthbullapur", 
  "Qila Mohd. Nagar", "Raidurg", "Raigiri", "Rajapet", "Rajendranagar", "Ramachandrapuram", 
  "Ramannapet", "Ramkoti", "Rampally", "Rangapur", "Ravalkole", "Raviryal", "Razdarkhanpet", 
  "RC Puram", "Red Hills", "Rein Bazaar", "Rudraram", "R K Puram", "RTC Colony", "RTC X Roads", 
  "Saheb Nagar", "Saheb Nagar Kalan", "Saheb Nagar Khurd", "Saifabad", "Saidabad", "Sainikpuri", 
  "Safilguda", "Sanath Nagar", "Sanathnagar", "Santoshnagar", "Santosh Nagar", "Sardar Nagar", "Saroornagar", 
  "Satamrai", "Sadasivpet", "Serilingampally", "Secunderabad", "Shadnagar", "Shameerpet (Shamirpet)", 
  "Shamshabad", "Shankarpally", "Shastripuram", "Shaikpet", "Sheriguda", "Shivampet", "Sikh Village", 
  "Singapore Township", "Sitarampur", "Solipur", "Somajiguda", "SR Nagar", "Sultan Bazaar", "Sultan Bagh", 
  "Sultanpur", "Suraram", "Survepally", "Suchitra", "Sun City", "Taramatipet", "Talab Katta", 
  "Talabchanchalam", "Talakondapally", "Tellapur", "Teegalguda", "Thimmaipally", "Thokatta", 
  "Thummaloor", "TNGOs Colony", "Tolichowki", "Toopran", "Totaguda", "Trimulgherry", "Tirumalagiri", 
  "Troop Bazaar", "Turkayamjal", "Tukkuguda (Thukkuguda)", "Uppal", "Uppuguda", "Valigonda", 
  "Vanasthalipuram", "Vasanth Nagar", "Veldanda", "Velimela", "Vikarabad", "Vijayanagar Colony", 
  "Vinayak Nagar", "Vivekananda Nagar Colony", "Wangapally", "Whitefields", "Yacharam", "Yakutpura", 
  "Yadagirigutta", "Yadadri", "Yadgarpally", "Yamnampet", "Yapral", "Yelal", "Yellareddyguda", 
  "Yousufguda", "Zamistanpur", "Zeregumbad"
];

export const HYDERABAD_ZONES = [
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
];

export const HYDERABAD_LOCALITIES = Array.from(new Set(RAW_HYDERABAD_LOCALITIES)).sort();
