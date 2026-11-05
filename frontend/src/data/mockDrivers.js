/**
 * MANA DRIVERS - Official Dataset & Supported Locations Matrix
 * Integrates 300+ Hyderabad and Greater Hyderabad locations for automated routing & selection.
 */

// Strictly zero dummy users - only live dynamic drivers from backend API are used
export const initialDrivers = [];


export const DRIVER_TYPES = [
  { id: 'all', label: 'All Drivers' },
  { id: 'freelance', label: 'Temporary / City Duty (₹700 for 4 hrs)' },
  { id: 'permanent', label: 'Permanent / Monthly Duty (₹25k – ₹30k/mo)' },
];

export const RAW_HYDERABAD_LOCALITIES = [
  "Abdullapurmet", "Addagudur", "Adibatla", "Afzal Gunj", "Ahmadguda", "Alair", "Aliabad", "Ali Samunder", 
  "Alkapur Township", "Alkapuri", "Almasguda", "Alwal", "Amberpet", "Amberpet Sarfekhas", "Ameenpur", 
  "Amangal", "Ammuguda", "Anandbagh", "Annojiguda", "Asif Nagar", "Athmakur", "Attapur", "Auto Nagar", 
  "Aziznagar", "B N Reddy Nagar", "Bacharam", "Bachupally", "Bagh Lingampally", "Bahadurpura", 
  "Bahlookhanguda", "Bakaram", "Bakhtawarguda", "Balapur", "Balanagar", "Balkampet", "Bandlaguda", 
  "Bandlaguda Jagir", "Bandlaguda Kalsa", "Bank Street", "Barkas", "Basheerbagh", "Begum Bazaar", 
  "Begumpet", "Beeramguda", "Bharat Nagar", "Bhagya Nagar Colony", "Bhanur", "Bibinagar", "Bolarum", 
  "Bollaram", "Bollaram Industrial Area", "Bommalaramaram", "Bondilguda", "Boduppal", "Bogaram", 
  "Bowenpally", "Bholakpur", "Bhuvanagiri (Bhongir)", "Burgul", "Budwel", "Chaderghat", "Chanchalguda", 
  "Chandrayangutta", "Chandulal Bowli", "Chandanagar", "Chattanpally", "Chatta Bazaar", "Chaitanyapuri", 
  "Chevella", "Cherlapally", "Chengicherla", "Chikkadpally", "Chilkur", "Chinna Kandukur", "Chitkul", 
  "Chityal", "Choutuppal", "Chowdhariguda", "Chudi Bazaar", "Clock Tower", "Dabilpur", "Daira", 
  "Dammaiguda", "Dandumalkapur", "Dharur", "Deepthisri Nagar", "Dilsukhnagar", "Domalguda", 
  "Drainage Lingampally", "Doulatabad", "Edulabad", "Edulanagulapally", "ECIL", "East Marredpally", 
  "Ellagiri", "Erragadda", "Esamia Bazaar", "Falaknuma", "Farooqnagar", "Fateh Nagar", "Feelkhana", 
  "Ferozguda", "Financial District", "Gaddiannaram", "Gagan Mahal", "Gaganpahad", "Gajularamaram", 
  "Gandipet", "Ghatkesar", "Ghansi Bazaar", "Golconda", "Gopanpally", "Gowliguda", "Gowrelli", 
  "Greenlands", "Guddimalkapur", "Gudimalkapur", "Gudur", "Gulmohar Park", "Gundlapochampally", 
  "Gundrampally", "Gundala", "Gurramguda", "Gummadidala", "Hafeezpet", "Habsiguda", "Hakimpet", 
  "Hanwada", "Hasanaliguda", "Hasthinapuram", "Hayathnagar", "Himayat Sagar", "Himayatnagar", 
  "HMT Colony", "Hyderguda", "Hydernagar", "Hydershakote", "IDPL Colony", "Ibrahimpatnam", 
  "Ibrahimbagh", "Injapur", "Inmulnarva", "IS Sadan", "Isnapur", "Jahanuma", "Jadcherla", 
  "Jagadgiri Gutta", "Jalpally", "Janwada", "Jawaharnagar", "Jaya Prakash Narayan Nagar", 
  "Jeedimetla", "Jeedipally", "Jillelguda", "Jinnaram", "JNTU", "Jubilee Hills", "Kachiguda", 
  "Kacharam", "Kadthal", "Kandukur", "Kandlakoya", "Kandikal", "Kandi", "Kanchanbagh", "Kardanur", 
  "Karwan", "Karkhana", "Katedan", "Kapra", "Kallakal", "Kaiwanja", "Keesara", "Keesara Gutta", 
  "Keshampet", "Khairatabad", "Khajaguda", "King Koti", "Kishanbagh", "Kismatpur", "Kokapet", 
  "Kollur", "Kompally", "Kondakal", "Kondapur", "Kondurg", "Kongara Kalan", "Kongara Khurd", 
  "Kothapet", "Kothur", "Kothwalguda", "Koyyalagudem", "KPHB Colony", "Kulkacharla", "Kulsumpura", 
  "Kuntloor", "Kurmalguda", "Kushaiguda", "Lakdikapul", "Lalaguda", "Lalithabagh", "Langar Houz", 
  "Lakkaram", "LB Nagar", "Lemoor", "Lingampally", "Madeenaguda (Madinaguda)", "Madhapur", 
  "Madhuban Colony", "Madannapet", "Mahabubnagar", "Maheshwaram", "Mailardevpally", "Macha Bollaram", 
  "Machabolaram", "Mallapur", "Malkajgiri", "Malkajgiri Cantonment", "Malkapur", "Malakpet", 
  "Mallepally", "Mallepalli", "Mamidipally", "Manchal", "Manchirevula", "Mangalpally", "Mansanpally", 
  "Mansoorabad", "Marpally", "Marredpally", "Masab Tank", "Masjid Banda", "Medak", "Medchal", 
  "Medipally", "Mehdipatnam", "Meerpet", "Meersagar", "Minister Road", "Midjil", "Miyapur", 
  "Miyapur X Roads", "Miyakunta", "Moinabad", "Moghalpura", "Mokila", "Moosapet", "Moosarambagh", 
  "Motakondur", "Moula Ali", "Mothkur", "Mulugu", "Musheerabad", "Mustyalapally", "Mucherla", 
  "Murad Mahal", "Nadergul", "Nagaram", "Nagole", "Nallagandla", "Nampally", "Nandigama", 
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
  "Safilguda", "Sanathnagar", "Santoshnagar", "Santosh Nagar", "Sardar Nagar", "Saroornagar", 
  "Satamrai", "Sadasivpet", "Serilingampally", "Secunderabad", "Shadnagar", "Shameerpet (Shamirpet)", 
  "Shankarpally", "Shastripuram", "Shaikpet", "Sheriguda", "Shivampet", "Sikh Village", 
  "Singapore Township", "Sitarampur", "Solipur", "Somajiguda", "Sultan Bazaar", "Sultan Bagh", 
  "Sultanpur", "Suraram", "Survepally", "Suchitra", "Sun City", "Taramatipet", "Talab Katta", 
  "Talabchanchalam", "Talakondapally", "Tellapur", "Teegalguda", "Thimmaipally", "Thokatta", 
  "Thummaloor", "TNGOs Colony", "Toopran", "Totaguda", "Trimulgherry", "Tirumalagiri", 
  "Troop Bazaar", "Turkayamjal", "Tukkuguda (Thukkuguda)", "Uppal", "Uppuguda", "Valigonda", 
  "Vanasthalipuram", "Vasanth Nagar", "Veldanda", "Velimela", "Vikarabad", "Vijayanagar Colony", 
  "Vinayak Nagar", "Vivekananda Nagar Colony", "Wangapally", "Whitefields", "Yacharam", "Yakutpura", 
  "Yadagirigutta", "Yadadri", "Yadgarpally", "Yamnampet", "Yapral", "Yelal", "Yellareddyguda", 
  "Yousufguda", "Zamistanpur", "Zeregumbad"
];

// Clean deduplicated sorted list
export const HYDERABAD_LOCALITIES = Array.from(new Set(RAW_HYDERABAD_LOCALITIES)).sort();
