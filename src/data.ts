import { EmergencyShelter, AidRequest, AidOffer, IncidentReport, RainAlert, WeatherInfo } from "./types";

// Seed coordinates centered around Pakistan (Faisalabad default epicenter)
export const CENTER_LAT = 31.4504;
export const CENTER_LNG = 73.1350;

export const INITIAL_SHELTERS: EmergencyShelter[] = [
  // 1. Karachi
  {
    id: "shelter-pk-karachi-1",
    name: "Karachi Expo Centre Relief Camp (NDMA / Saylani)",
    address: "University Road, Gulshan-e-Iqbal, Karachi, Sindh",
    phone: "+92 (21) 111-111-122",
    lat: 24.8922,
    lng: 67.0544,
    capacityTotal: 800,
    capacityUsed: 620,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "State-of-the-art secure base with standby generators, massive water filtration plants, and doctors from Indus Hospital."
  },
  {
    id: "shelter-pk-karachi-2",
    name: "Edhi Welfare Disaster Complex",
    address: "Sohrab Goth, Super Highway, Karachi, Sindh",
    phone: "115 (Toll Free)",
    lat: 24.9654,
    lng: 67.0862,
    capacityTotal: 500,
    capacityUsed: 492,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Nearly full capacity. Providing immediate cooked meals (Biryani/Daal), warm clothes, and clean mineral water."
  },
  {
    id: "shelter-pk-karachi-3",
    name: "Lyari Community Gym-Relief Ward",
    address: "Chakiwara Road, Lyari Town, Karachi, Sindh",
    phone: "+92 (21) 99230611",
    lat: 24.8600,
    lng: 66.9900,
    capacityTotal: 300,
    capacityUsed: 110,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: true,
    allowsPets: false,
    notes: "Providing indoor mats, blankets, and hot baby formula. Managed by local commissioners."
  },

  // 2. Lahore
  {
    id: "shelter-pk-lahore-1",
    name: "Lahore Nishtar Stadium Sports Complex Center",
    address: "Ferozepur Road, Gulberg, Lahore, Punjab",
    phone: "+92 (42) 111-111-122",
    lat: 31.5122,
    lng: 74.3294,
    capacityTotal: 1000,
    capacityUsed: 150,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Massive dry indoor arena setup. Accepting displaced families with backup mobile power supply charging docks."
  },
  {
    id: "shelter-pk-lahore-2",
    name: "Minar-e-Pakistan Relief Encampment",
    address: "Greater Iqbal Park, Walled City, Lahore, Punjab",
    phone: "+92 (42) 99211234",
    lat: 31.5900,
    lng: 74.3200,
    capacityTotal: 400,
    capacityUsed: 50,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: true,
    hasPower: false,
    allowsPets: true,
    notes: "Outdoor waterproof canopy tents erected. Mobile emergency medical unit on standby."
  },

  // 3. Faisalabad
  {
    id: "shelter-pk-faisalabad-1",
    name: "Faisalabad Iqbal Stadium Relief Arena",
    address: "Civil Lines, near Kutchery Bazaar, Faisalabad, Punjab",
    phone: "+92 (41) 9200888",
    lat: 31.4235,
    lng: 73.0822,
    capacityTotal: 650,
    capacityUsed: 120,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Centrally located with direct dry bedding, clean water filtration, medical clinic by Allied Hospital doctors, and mobile emergency power bank charging hubs."
  },
  {
    id: "shelter-pk-faisalabad-2",
    name: "University of Agriculture Faisalabad (UAF) Hall",
    address: "Jail Road, Faisalabad, Punjab",
    phone: "+92 (41) 9201743",
    lat: 31.4278,
    lng: 73.0721,
    capacityTotal: 450,
    capacityUsed: 310,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "UAF Main Campus Relief Ward. Providing warm food (Daal Chawal/Channa Rice) and clean drinking bottled water."
  },

  // 4. Islamabad
  {
    id: "shelter-pk-islamabad-1",
    name: "Islamabad Sector H-8 Red Crescent Society Hall",
    address: "Sector H-8, Islamabad Capital Territory",
    phone: "+92 (51) 9250404",
    lat: 33.6685,
    lng: 73.0725,
    capacityTotal: 350,
    capacityUsed: 350,
    status: "full",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: false,
    allowsPets: false,
    notes: "CRITICAL: No incoming spaces. All capacity is currently full. Redirecting incoming families toward Nishtar Field Station."
  },
  {
    id: "shelter-pk-islamabad-2",
    name: "G-9 Community Center Emergency Shelter",
    address: "Sector G-9, Islamabad Capital Territory",
    phone: "+92 (51) 9260112",
    lat: 33.6900,
    lng: 73.0300,
    capacityTotal: 250,
    capacityUsed: 95,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: true,
    allowsPets: true,
    notes: "Spacious dry community center. Providing standard bedding, dry rations, and volunteer-provided pediatric milk formula."
  },

  // 5. Rawalpindi
  {
    id: "shelter-pk-rawalpindi-1",
    name: "Liaquat Bagh Sports Complex Ground",
    address: "Murree Road, Rawalpindi, Punjab",
    phone: "+92 (51) 1122",
    lat: 33.6007,
    lng: 73.0679,
    capacityTotal: 600,
    capacityUsed: 420,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "Rescue 1122 command center on site. Direct assistance for families affected by Nullah Lai rising levels."
  },
  {
    id: "shelter-pk-rawalpindi-2",
    name: "Committee Chowk Public School Shelter",
    address: "Committee Chowk area, Rawalpindi, Punjab",
    phone: "+92 (51) 5554321",
    lat: 33.5651,
    lng: 73.0169,
    capacityTotal: 200,
    capacityUsed: 195,
    status: "limited",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: true,
    allowsPets: false,
    notes: "Nearly at full capacity. Mainly accommodating local shopkeepers and nearby residents seeking dry storage."
  },

  // 6. Peshawar
  {
    id: "shelter-pk-peshawar-1",
    name: "Peshawar Cantt Relief Block (PDMA Khyber Road)",
    address: "Khyber Road, Cantonment Area, Peshawar, KPK",
    phone: "+92 (91) 9213839",
    lat: 34.0094,
    lng: 71.5367,
    capacityTotal: 400,
    capacityUsed: 0,
    status: "closed",
    hasFood: false,
    hasClothes: false,
    hasMedical: false,
    hasPower: false,
    allowsPets: true,
    notes: "PDMA backup shelter facility ready for immediate activation in the event of Peshawar/Nowshera River Kabul overflows."
  },
  {
    id: "shelter-pk-peshawar-2",
    name: "Hayatabad Sports Complex Emergency Camp",
    address: "Phase 6, Hayatabad, Peshawar, KPK",
    phone: "+92 (91) 9217644",
    lat: 34.0200,
    lng: 71.5200,
    capacityTotal: 350,
    capacityUsed: 80,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Excellent modern complex setup with private partitions, first-aid center, and 24-hour ambulance support."
  },

  // 7. Quetta
  {
    id: "shelter-pk-quetta-1",
    name: "Quetta Railway Housing Relief Post",
    address: "Asgari Park Road near Joint Road, Quetta, Balochistan",
    phone: "+92 (81) 111-111-122",
    lat: 30.1820,
    lng: 66.9850,
    capacityTotal: 250,
    capacityUsed: 80,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Sufficient space for flash flood evacuees arriving from sub-mountain runoffs."
  },
  {
    id: "shelter-pk-quetta-2",
    name: "Cantonment Board Community Hall",
    address: "Staff College Road, Quetta, Balochistan",
    phone: "+92 (81) 9201509",
    lat: 30.2200,
    lng: 67.0100,
    capacityTotal: 300,
    capacityUsed: 285,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "Very high elevation safe point. Offering dry rations, baby milk, and warm wool blankets."
  },

  // 8. Multan
  {
    id: "shelter-pk-multan-1",
    name: "Multan Cricket Stadium Relief Ward",
    address: "Vehari Road, Multan, Punjab",
    phone: "+92 (61) 9220144",
    lat: 30.1575,
    lng: 71.5249,
    capacityTotal: 500,
    capacityUsed: 120,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Flood evacuation zone base. Standby drinking water filtration tank and district healthcare staff."
  },
  {
    id: "shelter-pk-multan-2",
    name: "Shah Rukn-e-Alam Community Shelter",
    address: "Shah Rukn-e-Alam Colony, Multan, Punjab",
    phone: "+92 (61) 6781220",
    lat: 30.1800,
    lng: 71.4800,
    capacityTotal: 150,
    capacityUsed: 150,
    status: "full",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: true,
    allowsPets: false,
    notes: "CRITICAL CAPACITY REACHED. Fully occupied by local low-lying urban flood refugees."
  },

  // 9. Hyderabad
  {
    id: "shelter-pk-hyderabad-1",
    name: "Hyderabad Board Welfare Complex",
    address: "Latifabad No. 9, Hyderabad, Sindh",
    phone: "+92 (22) 9240188",
    lat: 25.3960,
    lng: 68.3772,
    capacityTotal: 400,
    capacityUsed: 250,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "Providing active dry dry bedding, Indus General hospital medical dispatch squad, and mobile power sources."
  },
  {
    id: "shelter-pk-hyderabad-2",
    name: "Qasimabad Government Degree College",
    address: "Main Road Qasimabad, Hyderabad, Sindh",
    phone: "+92 (22) 9200311",
    lat: 25.4100,
    lng: 68.3500,
    capacityTotal: 300,
    capacityUsed: 30,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: false,
    allowsPets: true,
    notes: "Classrooms cleared for flood shelter setups. Dry rations and wheat distributions daily by NGOs."
  },

  // 10. Gujranwala
  {
    id: "shelter-pk-gujranwala-1",
    name: "Gujranwala Jinnah Sports Stadium Camp",
    address: "Sialkot Road, Gujranwala, Punjab",
    phone: "+92 (55) 9200611",
    lat: 32.1877,
    lng: 74.1945,
    capacityTotal: 450,
    capacityUsed: 90,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Managed by Pak Army and civil administration. Providing clean water, cooked rice meals, and medical clinics."
  },
  {
    id: "shelter-pk-gujranwala-2",
    name: "Pasrur Road Secondary School",
    address: "Pasrur Road Area, Gujranwala, Punjab",
    phone: "+92 (55) 5556789",
    lat: 32.1500,
    lng: 74.2200,
    capacityTotal: 150,
    capacityUsed: 140,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: false,
    allowsPets: false,
    notes: "Safe dry brick structure. Local neighborhood donations of blankets and warm clothing."
  },

  // 11. Sialkot
  {
    id: "shelter-pk-sialkot-1",
    name: "Sialkot Govt High School Shelter Hub",
    address: "Shahabpura Road, Sialkot, Punjab",
    phone: "+92 (52) 9250122",
    lat: 32.4945,
    lng: 74.5229,
    capacityTotal: 300,
    capacityUsed: 220,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "Serving rain-displaced families from the surrounding Aik Nullah stream basin overflows."
  },
  {
    id: "shelter-pk-sialkot-2",
    name: "Cantt Welfare Sports Club Ward",
    address: "Tariq Road, Cantonment Area, Sialkot, Punjab",
    phone: "+92 (52) 4293811",
    lat: 32.5200,
    lng: 74.5500,
    capacityTotal: 250,
    capacityUsed: 40,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: true,
    allowsPets: true,
    notes: "High ground facility, less flood direct risk. Standby emergency vehicles ready."
  },

  // 12. Sukkur
  {
    id: "shelter-pk-sukkur-1",
    name: "Sukkur Barrage Emergency Relief Camp",
    address: "Barrage Road near Indus Canal, Sukkur, Sindh",
    phone: "+92 (71) 9310111",
    lat: 27.7244,
    lng: 68.8472,
    capacityTotal: 500,
    capacityUsed: 470,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Rescue boats stationed directly here. Core camp for river runoff evacuations."
  },
  {
    id: "shelter-pk-sukkur-2",
    name: "Public School Military Road Refuge",
    address: "Military Road, Sukkur, Sindh",
    phone: "+92 (71) 5630244",
    lat: 27.7000,
    lng: 68.8100,
    capacityTotal: 300,
    capacityUsed: 20,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: false,
    allowsPets: false,
    notes: "Large hall cleared for community disaster logistics and backup storage."
  },

  // 13. Bahawalpur
  {
    id: "shelter-pk-bahawalpur-1",
    name: "Yazman Road Civil Defense Shelter",
    address: "Yazman Road near bypass, Bahawalpur, Punjab",
    phone: "+92 (62) 9250109",
    lat: 29.3956,
    lng: 71.6833,
    capacityTotal: 200,
    capacityUsed: 40,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Pre-equipped with solar emergency batteries, clean drinking borehole water, and dry rations."
  },
  {
    id: "shelter-pk-bahawalpur-2",
    name: "Bahawalpur Zoo Stadium Base",
    address: "Stadium Road, Bahawalpur, Punjab",
    phone: "+92 (62) 9250125",
    lat: 29.4100,
    lng: 71.6500,
    capacityTotal: 150,
    capacityUsed: 0,
    status: "closed",
    hasFood: false,
    hasClothes: false,
    hasMedical: false,
    hasPower: false,
    allowsPets: true,
    notes: "Inactive secondary station, can activate on demand for Sutlej river rise."
  },

  // 14. Sargodha
  {
    id: "shelter-pk-sargodha-1",
    name: "Sargodha Garrison Sports Complex Refuge",
    address: "PAF Road Sports Block, Sargodha, Punjab",
    phone: "+92 (48) 9230511",
    lat: 32.0740,
    lng: 72.6861,
    capacityTotal: 350,
    capacityUsed: 110,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: false,
    notes: "Extremely secure, military-backed community relief post. Generous dry stocks."
  },
  {
    id: "shelter-pk-sargodha-2",
    name: "University Road Boys College Shelter",
    address: "University Road, Sargodha, Punjab",
    phone: "+92 (48) 3214511",
    lat: 32.1000,
    lng: 72.6500,
    capacityTotal: 200,
    capacityUsed: 15,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: true,
    allowsPets: true,
    notes: "Basic cots, tea station, and local community-led child care room."
  },

  // 15. Abbottabad
  {
    id: "shelter-pk-abbottabad-1",
    name: "Abbottabad Pine Hall Relief Ward",
    address: "Main Mansehra Road, Link Block, Abbottabad, KPK",
    phone: "+92 (992) 334055",
    lat: 34.1688,
    lng: 73.2215,
    capacityTotal: 250,
    capacityUsed: 180,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "High mountain climate relief. Distributing warm jackets, fleece blankets, and hot meals."
  },
  {
    id: "shelter-pk-abbottabad-2",
    name: "Mandian Govt College Shelter Hub",
    address: "College Road, Mandian Town, Abbottabad, KPK",
    phone: "+92 (992) 381255",
    lat: 34.1900,
    lng: 73.2400,
    capacityTotal: 150,
    capacityUsed: 145,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: false,
    allowsPets: false,
    notes: "Providing basic soup kitchen and shelter mats. Nearly exhausted of capacity."
  },

  // 16. Gilgit
  {
    id: "shelter-pk-gilgit-1",
    name: "Gilgit Town Hall Rescue Station",
    address: "Hospital Road, Gilgit Town, Gilgit-Baltistan",
    phone: "+92 (5811) 920444",
    lat: 35.9208,
    lng: 74.3089,
    capacityTotal: 200,
    capacityUsed: 140,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Serving landslide-affected travelers and mountain community evacuees. Offering thick wool blankets."
  },
  {
    id: "shelter-pk-gilgit-2",
    name: "Karakoram Highway Camp No. 1",
    address: "Jutial area near KKH bypass, Gilgit, GB",
    phone: "+92 (5811) 1122",
    lat: 35.8900,
    lng: 74.3500,
    capacityTotal: 150,
    capacityUsed: 145,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: false,
    allowsPets: true,
    notes: "Roadblock refuge camp. Actively backed up by District Disaster Officers."
  },

  // 17. Gwadar
  {
    id: "shelter-pk-gwadar-1",
    name: "Gwadar Port Authority Community Post",
    address: "Port Security Block, Gwadar, Balochistan",
    phone: "+92 (86) 9200422",
    lat: 25.1216,
    lng: 62.3254,
    capacityTotal: 300,
    capacityUsed: 40,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Safe concrete marine headquarters. Coastal wave storm shelter ready."
  },
  {
    id: "shelter-pk-gwadar-2",
    name: "Marine Drive Safe Heights Refuge",
    address: "Koh-e-Batil Road, Gwadar, Balochistan",
    phone: "+92 (86) 5420111",
    lat: 25.1400,
    lng: 62.3500,
    capacityTotal: 150,
    capacityUsed: 10,
    status: "open",
    hasFood: true,
    hasClothes: false,
    hasMedical: false,
    hasPower: false,
    allowsPets: false,
    notes: "Extremely high elevation, bypasses all coastal surge threats. Bare minimum facilities."
  },

  // 18. Muzaffarabad
  {
    id: "shelter-pk-muzaffarabad-1",
    name: "Muzaffarabad Sports Stadium Aid Camp",
    address: "Upper Chattar, Muzaffarabad, Azad Kashmir",
    phone: "+92 (5822) 920012",
    lat: 34.3700,
    lng: 73.4708,
    capacityTotal: 400,
    capacityUsed: 190,
    status: "open",
    hasFood: true,
    hasClothes: true,
    hasMedical: true,
    hasPower: true,
    allowsPets: true,
    notes: "Neelum River overflow refugee point. Distributing hot tea, warm bread, socks, and medicines."
  },
  {
    id: "shelter-pk-muzaffarabad-2",
    name: "Chattar Area Relief Post",
    address: "Secretariat Road near Court House, Muzaffarabad, AJK",
    phone: "+92 (5822) 992444",
    lat: 34.3900,
    lng: 73.5000,
    capacityTotal: 150,
    capacityUsed: 140,
    status: "limited",
    hasFood: true,
    hasClothes: true,
    hasMedical: false,
    hasPower: false,
    allowsPets: false,
    notes: "Solid government building refuge point. Crowded with adjacent slide victims."
  }
];

export const INITIAL_AID_REQUESTS: AidRequest[] = [
  {
    id: "req-pk-1",
    requesterName: "Muhammad Farhan",
    phone: "+92 (300) 123-4567",
    location: "Malir River Bed Settlement, Karachi",
    category: "clothes",
    urgency: "immediate",
    headcount: 5,
    description: "Malir River overflowed and entered boundary walls. Seeking dry clothes, warm blankets, and formula milk for 6-month-old infant.",
    status: "pending",
    createdAt: "2026-06-06T18:00:00Z"
  },
  {
    id: "req-pk-2",
    requesterName: "Ayesha Bibi",
    phone: "+92 (321) 987-6543",
    location: "Rawalpindi Nullah Lai Near Katarian Bridge",
    category: "food",
    urgency: "high",
    headcount: 3,
    description: "Water level rising rapidly in street. We are stuck on the first floor. Power is cut off. Need uncooked dry rations (wheat, lentils) or emergency cooked packets.",
    status: "pending",
    createdAt: "2026-06-06T18:15:00Z"
  },
  {
    id: "req-pk-3",
    requesterName: "Zahid Jan",
    phone: "+92 (315) 445-5667",
    location: "Karakoram Highway Landslide blocked zone, Gilgit",
    category: "blankets",
    urgency: "immediate",
    headcount: 8,
    description: "A huge mudflow blocked the main road. 8 of us stranded in our van with dropping sub-zero mountain temperatures. We need heavy dry blankets and hot tea.",
    status: "pending",
    createdAt: "2026-06-06T18:30:00Z"
  },
  {
    id: "req-pk-4",
    requesterName: "Sabeen Fatima",
    phone: "+92 (333) 888-2233",
    location: "Saryab Road, Quetta",
    category: "hygiene",
    urgency: "medium",
    headcount: 4,
    description: "Sewerage overflow due to flash rain. Need baby diapers, hand sanitizers, and basic sanitary napkins.",
    status: "fulfilled",
    createdAt: "2026-06-06T17:10:00Z"
  }
];

export const INITIAL_AID_OFFERS: AidOffer[] = [
  {
    id: "off-pk-1",
    donorName: "Saylani Welfare International Trust",
    phone: "115 (Karachi Center)",
    category: "food",
    description: "500 cooked Biryani boxes and 1000 water bottles. Standing by in mobile delivery trucks to dispatch anywhere inside Karachi or Hyderabad.",
    location: "Saylani Head Office, Bahadurabad, Karachi",
    status: "available",
    createdAt: "2026-06-06T17:45:00Z"
  },
  {
    id: "off-pk-2",
    donorName: "Al Khidmat Foundation Association",
    phone: "+92 (42) 35957260",
    category: "clothes",
    description: "Durable tarpaulins, plastic tents, sleeping bags, and warm shawls for flood-affected families. Ready for immediate load distribution.",
    location: "Al Khidmat Complex, Lahore",
    status: "available",
    createdAt: "2026-06-06T18:10:00Z"
  }
];

export const INITIAL_INCIDENT_REPORTS: IncidentReport[] = [
  {
    id: "incident-pk-1",
    type: "flooding",
    reporterName: "Assistant Commissioner Gulshan",
    phone: "+92 (333) 911-0112",
    location: "Nipa Chowrangi Underpass, Gulshan-e-Iqbal, Karachi",
    description: "Underpass water level is reaching 5 feet high. Stalled vehicles. Traffic police active on site. 15 citizens guided onto overhead footbridges, awaiting safe high-clearance shuttle transport.",
    headcount: 15,
    status: "dispatched",
    createdAt: "2026-06-06T18:05:00Z"
  },
  {
    id: "incident-pk-2",
    type: "landslide",
    reporterName: "Rescue Officer Kamal",
    phone: "1122 (KPK Wing)",
    location: "Besham Highway Area, Shangla District, KPK",
    description: "Major mountain landslide blocking vehicular passage. Multi-ton heavy boulder completely obstructs both lanes. Heavy machinery mobilized, 6 tourists trapped in shelter point.",
    headcount: 6,
    status: "verified",
    createdAt: "2026-06-06T18:25:00Z"
  }
];

export const INITIAL_RAIN_ALERTS: RainAlert[] = [
  {
    id: "alert-pk-1",
    severity: "severe",
    title: "ALERT: Heavy Monsoon Storm Alert for Pakistan",
    message: "NDMA issues extreme weather advisory. Massive cloudbursts expected across Karachi, Hyderabad, Lahore, and Rawalpindi. Rainfall rates might surpass 55mm/hr, generating major street ponding or Nullah overflows.",
    timestamp: "2026-06-06T18:40:00Z",
    isSuddenChance: true
  },
  {
    id: "alert-pk-2",
    severity: "moderate",
    title: "Kabul River Overflow Precaution",
    message: "Water levels at Nowshera are rising. Riverside residents are strongly advised to migrate along with core assets to the nearest designated PDMA community shelter camps.",
    timestamp: "2026-06-06T18:15:00Z",
    isSuddenChance: false
  }
];

export const INITIAL_WEATHER: WeatherInfo = {
  temp: 32, // Celsius (Localized)
  condition: "Severe Monsoon Overcast / Rain",
  humidity: 88,
  windSpeed: 28, // km/hr
  precipitationPr: 95,
  precipitationRate: 40, // mm/hr
  pressure: 990, // Low tropical pressure
  place: "Faisalabad City Metropolitan, Punjab, Pakistan"
};

// Precise and physical coordinate distance in Kilometers
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (lat1 === lat2 && lng1 === lng2) return 0;
  
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  
  return parseFloat(dist.toFixed(1));
}

// Emergency Contacts (Localized to real Pakistan rescue lines)
export const EMERGENCY_CONTACTS = [
  { service: "National Emergency Rescue Call Line", phone: "1122" },
  { service: "Edhi Ambulance & Welfare Hub", phone: "115" },
  { service: "Chippa Disaster Rescue Helpline", phone: "1020" },
  { service: "NDMA National Storm Coordination Room", phone: "051-111-157-157" }
];
