/**
 * UPSA Life - Game Constants, NPC Data, Courses, Campus Locations & Missions
 */

import { Course, Mission } from '../types/game';

export interface NPCData {
  id: string;
  name: string;
  programme: string;
  level: number;
  bio: string;
  avatarColor: string;
  shirtColor: string;
  favoriteHangout: string;
  defaultStatus: string;
  roomNumber?: string;
  isHostelRoommate?: boolean;
}

export const NPCS: Record<string, NPCData> = {
  ama: {
    id: 'ama',
    name: 'Ama Serwaa',
    programme: 'BSc Accounting',
    level: 200,
    bio: 'Diligent and sharp. Loves group revision sessions at the Central Library and always has the best lecture notes.',
    avatarColor: '#d97706',
    shirtColor: '#ea580c',
    favoriteHangout: 'Central Library',
    defaultStatus: 'Studying ACC 201 balance sheets 📚',
    roomNumber: 'B-104',
  },
  kwame: {
    id: 'kwame',
    name: 'Kwame Mensah',
    programme: 'BSc Information Technology',
    level: 300,
    bio: 'Full-stack developer, gamer, and tech enthusiast. Usually spotted debugging code at the Students Centre or Lab.',
    avatarColor: '#2563eb',
    shirtColor: '#0284c7',
    favoriteHangout: 'Students Centre',
    defaultStatus: 'Building a new campus startup app 💻',
    roomNumber: 'A-202',
  },
  esi: {
    id: 'esi',
    name: 'Esi Addo',
    programme: 'BSc Business Administration',
    level: 200,
    bio: 'Vibrant entrepreneur running a thrift store and pastry business on campus. Knows everyone in Banking Square.',
    avatarColor: '#db2777',
    shirtColor: '#e11d48',
    favoriteHangout: 'Banking Square & Food Court',
    defaultStatus: 'Delivering fresh pastries across hostels ✨',
    roomNumber: 'C-301',
  },
  kojo: {
    id: 'kojo',
    name: 'Kojo Owusu',
    programme: 'BSc Marketing',
    level: 300,
    bio: 'Varsity football winger and social coordinator. Hangs out around the AstroTurf and Student Union lounge.',
    avatarColor: '#16a34a',
    shirtColor: '#059669',
    favoriteHangout: 'AstroTurf Sports Complex',
    defaultStatus: 'Training for the Inter-Faculty Cup ⚽',
    roomNumber: 'A-108',
  },
  prof_boateng: {
    id: 'prof_boateng',
    name: 'Dr. Boateng',
    programme: 'Faculty Dean / Senior Lecturer',
    level: 400,
    bio: 'Distinguished lecturer known for challenging pop quizzes and inspiring real-world case studies in LBC 3.',
    avatarColor: '#475569',
    shirtColor: '#1e293b',
    favoriteHangout: 'Lecture Block Complex',
    defaultStatus: 'Reviewing mid-semester assessments 🎓',
  },
  auntie_mansah: {
    id: 'auntie_mansah',
    name: 'Auntie Mansah',
    programme: 'Campus Legend / Food Vendor',
    level: 100,
    bio: 'Cooks the most sought-after Waakye with spicy black shito, boiled eggs, wele, and plantain at the Student Centre.',
    avatarColor: '#b45309',
    shirtColor: '#78350f',
    favoriteHangout: 'Food Court',
    defaultStatus: 'Serving hot Waakye & Jollof packets 🍛',
  },
};

export interface CampusLocation {
  id: string;
  name: string;
  shortName: string;
  category: 'Academic' | 'Social' | 'Living' | 'Sports' | 'Admin';
  description: string;
  position: [number, number, number]; // 3D coordinates on campus
  color: string;
  iconName: string;
  hasActivity: boolean;
  activityTitle: string;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'auditorium',
    name: 'UPSA Main Auditorium',
    shortName: 'Auditorium',
    category: 'Admin',
    description: 'The monumental ultra-modern UPSA Auditorium. Host to matriculation, graduations, and national forums.',
    position: [0, 0, -45],
    color: '#3b82f6',
    iconName: 'Building',
    hasActivity: true,
    activityTitle: 'Attend Campus Symposium / Event',
  },
  {
    id: 'lbc',
    name: 'Lecture Block Complex (LBC)',
    shortName: 'LBC Halls',
    category: 'Academic',
    description: 'Multi-storey lecture facility where most faculty classes, lectures, and semester quizzes take place.',
    position: [-42, 0, -15],
    color: '#0284c7',
    iconName: 'GraduationCap',
    hasActivity: true,
    activityTitle: 'Attend Lecture & Pop Quiz',
  },
  {
    id: 'library',
    name: 'UPSA Central Library',
    shortName: 'Library',
    category: 'Academic',
    description: 'Quiet research floors, digital resource centre, and group discussion rooms for serious study sessions.',
    position: [42, 0, -18],
    color: '#059669',
    iconName: 'BookOpen',
    hasActivity: true,
    activityTitle: 'Intensive Research & Study Session',
  },
  {
    id: 'student_centre',
    name: 'Students Centre & Food Court',
    shortName: 'Food Court',
    category: 'Social',
    description: 'Buzzing hub with Auntie Mansah’s Waakye, Jollof, Kelewele, drinks, printing shops, and chill benches.',
    position: [-22, 0, 32],
    color: '#ea580c',
    iconName: 'Utensils',
    hasActivity: true,
    activityTitle: 'Buy Food & Refreshments',
  },
  {
    id: 'astroturf',
    name: 'UPSA Sports Complex & AstroTurf',
    shortName: 'AstroTurf',
    category: 'Sports',
    description: 'High-quality artificial turf stadium for football tournaments, athletics, workouts, and jogging.',
    position: [45, 0, 35],
    color: '#16a34a',
    iconName: 'Activity',
    hasActivity: true,
    activityTitle: 'Penalty Shootout Mini-Game',
  },
  {
    id: 'hostel_gate',
    name: 'UPSA Hostels Quad',
    shortName: 'Hostel Gate',
    category: 'Living',
    description: 'Entrance to Access Hostel, Yaa Asantewaa Hall, and Mandela Block. Head here to enter your room.',
    position: [0, 0, 48],
    color: '#8b5cf6',
    iconName: 'Home',
    hasActivity: true,
    activityTitle: 'Return to Hostel Room',
  },
  {
    id: 'banking_square',
    name: 'Banking Square & Admin',
    shortName: 'Banking Square',
    category: 'Admin',
    description: 'Campus banks, ATMs, and Student Services desk. Find part-time student work gigs here.',
    position: [-40, 0, 8],
    color: '#ca8a04',
    iconName: 'CreditCard',
    hasActivity: true,
    activityTitle: 'Work Campus Part-time Gig',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    code: 'ACC 101',
    name: 'Principles of Accounting',
    creditHours: 3,
    lecturer: 'Dr. Boateng',
    day: 'Monday',
    time: '08:00 - 10:00',
    venue: 'LBC Hall 4',
    attendance: 85,
    gradeScore: 82,
  },
  {
    code: 'ITEC 105',
    name: 'Introduction to Computing & Logic',
    creditHours: 3,
    lecturer: 'Ing. Mensah-Bonsu',
    day: 'Tuesday',
    time: '10:30 - 12:30',
    venue: 'LBC Lab 2',
    attendance: 90,
    gradeScore: 88,
  },
  {
    code: 'BUSA 102',
    name: 'Business Management & Ethics',
    creditHours: 3,
    lecturer: 'Mrs. Cynthia Quartey',
    day: 'Wednesday',
    time: '13:00 - 15:00',
    venue: 'Ohene Konadu Hall',
    attendance: 80,
    gradeScore: 78,
  },
  {
    code: 'MKT 103',
    name: 'Principles of Marketing',
    creditHours: 3,
    lecturer: 'Mr. Jude Tagoe',
    day: 'Thursday',
    time: '09:00 - 11:00',
    venue: 'LBC Hall 1',
    attendance: 75,
    gradeScore: 79,
  },
  {
    code: 'COMM 101',
    name: 'Academic Communication & Writing',
    creditHours: 2,
    lecturer: 'Dr. (Mrs) Acheampong',
    day: 'Friday',
    time: '11:30 - 13:00',
    venue: 'Main Auditorium Annex',
    attendance: 95,
    gradeScore: 91,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_orientation',
    title: 'UPSA Campus Tour',
    category: 'Campus',
    description: 'Explore the campus and visit the iconic UPSA Main Auditorium and the Students Centre.',
    locationHint: 'Head to the north end of campus to view the Auditorium.',
    targetNpcOrPlace: 'auditorium',
    rewardMoney: 150,
    rewardGpa: 0.05,
    completed: false,
    claimed: false,
  },
  {
    id: 'm2_meet_ama',
    title: 'Study Buddy Search',
    category: 'Social',
    description: 'Talk to Ama Serwaa near the Central Library and ask to compare revision notes.',
    locationHint: 'Ama hangs out near the green Central Library building.',
    targetNpcOrPlace: 'ama',
    rewardMoney: 100,
    rewardGpa: 0.08,
    rewardFriendship: { npcId: 'ama', amount: 20 },
    completed: false,
    claimed: false,
  },
  {
    id: 'm3_lecture_prep',
    title: 'First Lecture Attendance',
    category: 'Academics',
    description: 'Attend a lecture at the Lecture Block Complex (LBC) and pass the quick pop quiz.',
    locationHint: 'LBC building is on the west wing of campus.',
    targetNpcOrPlace: 'lbc',
    rewardMoney: 120,
    rewardGpa: 0.1,
    completed: false,
    claimed: false,
  },
  {
    id: 'm4_waakye_run',
    title: 'Auntie Mansah’s Waakye Feast',
    category: 'Survival',
    description: 'Visit the Food Court, greet Auntie Mansah, and order a steaming plate of Waakye or Jollof.',
    locationHint: 'Students Centre & Food Court on the south-west walkway.',
    targetNpcOrPlace: 'auntie_mansah',
    rewardMoney: 80,
    rewardGpa: 0.02,
    completed: false,
    claimed: false,
  },
  {
    id: 'm5_astroturf_match',
    title: 'Pitch Challenge with Kojo',
    category: 'Social',
    description: 'Head to the UPSA AstroTurf sports pitch and score at least 2 penalty kicks with Kojo.',
    locationHint: 'AstroTurf is located on the south-east side of campus.',
    targetNpcOrPlace: 'astroturf',
    rewardMoney: 160,
    rewardGpa: 0.04,
    rewardFriendship: { npcId: 'kojo', amount: 25 },
    completed: false,
    claimed: false,
  },
];

export interface HostelOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  singlePrice: number;
  doublePrice: number;
  triplePrice: number;
  quadPrice: number;
  amenities: string[];
  disclaimer: string;
}

export const HOSTEL_OPTIONS: HostelOption[] = [
  {
    id: 'access',
    name: 'Access Hostel',
    tagline: 'Premium modern living directly adjacent to campus',
    description: 'En-suite modern rooms with backup generators, study desks, AC options, and high-speed Wi-Fi.',
    singlePrice: 5200,
    doublePrice: 3800,
    triplePrice: 3100,
    quadPrice: 2400,
    amenities: ['Private Washroom', 'Backup Plant', 'Study Lounge', 'Campus Shuttle'],
    disclaimer: 'Representative example pricing (per semester in GH₵). Actual verified rates vary each academic year.',
  },
  {
    id: 'yaa_asantewaa',
    name: 'Yaa Asantewaa Hall',
    tagline: 'Vibrant on-campus student community',
    description: 'Great camaraderie, student common room, table tennis, and 2-minute walk to all lecture halls.',
    singlePrice: 4600,
    doublePrice: 3400,
    triplePrice: 2800,
    quadPrice: 2100,
    amenities: ['Common Room', 'Cafeteria On-site', 'Fast Campus Walk', 'Water Tank'],
    disclaimer: 'Representative example pricing (per semester in GH₵). Actual verified rates vary each academic year.',
  },
  {
    id: 'freedom',
    name: 'Freedom Hostel',
    tagline: 'Peaceful and study-focused atmosphere',
    description: 'Quiet environment favored by accounting and law students who prioritize midnight study sessions.',
    singlePrice: 4900,
    doublePrice: 3600,
    triplePrice: 2950,
    quadPrice: 2300,
    amenities: ['Quiet Zones', 'Balcony Views', '24/7 Security', 'Mini Mart'],
    disclaimer: 'Representative example pricing (per semester in GH₵). Actual verified rates vary each academic year.',
  },
  {
    id: 'mandela',
    name: 'Nelson Mandela Hall',
    tagline: 'Central location right by the Students Centre',
    description: 'Step right out of your door into the food court and banking square. High energy and convenience.',
    singlePrice: 4750,
    doublePrice: 3500,
    triplePrice: 2850,
    quadPrice: 2200,
    amenities: ['Central Courtyard', 'Laundry Service', 'Food Proximity', 'Gym Access'],
    disclaimer: 'Representative example pricing (per semester in GH₵). Actual verified rates vary each academic year.',
  },
];

export const FOOD_MENU = [
  {
    id: 'waakye_special',
    name: 'Auntie Mansah’s Mega Waakye',
    description: 'Steaming waakye with shito, boiled egg, fried fish, spaghetti & wele.',
    price: 35,
    hungerRestored: 50,
    happinessRestored: 30,
    energyRestored: 20,
    icon: '🍛',
  },
  {
    id: 'jollof_chicken',
    name: 'UPSA Hot Jollof & Grilled Chicken',
    description: 'Smoky party-style Ghanaian jollof rice with spiced chicken and green pepper sauce.',
    price: 40,
    hungerRestored: 45,
    happinessRestored: 35,
    energyRestored: 25,
    icon: '🍗',
  },
  {
    id: 'kelewele_peanuts',
    name: 'Kelewele & Roast Peanuts',
    description: 'Spiced ginger fried plantain cubes with crispy roasted groundnuts.',
    price: 20,
    hungerRestored: 25,
    happinessRestored: 40,
    energyRestored: 15,
    icon: '🍌',
  },
  {
    id: 'gob3_special',
    name: 'Classic Gob3 (Beans & Plantain)',
    description: 'Red red beans stew with fried ripe plantain, red palm oil & gari soakings.',
    price: 25,
    hungerRestored: 60,
    happinessRestored: 25,
    energyRestored: 15,
    icon: '🍲',
  },
  {
    id: 'ice_sobolo',
    name: 'Chilled Hibiscus Sobolo',
    description: 'Ice-cold hibiscus drink infused with ginger, cloves, and pineapple essence.',
    price: 12,
    hungerRestored: 10,
    happinessRestored: 25,
    energyRestored: 35,
    icon: '🧃',
  },
  {
    id: 'fanyogo_strawberry',
    name: 'FanYogo Strawberry Frozen Pouch',
    description: 'Campus classic Ghanaian frozen yoghurt. Perfect under the Accra afternoon sun.',
    price: 8,
    hungerRestored: 10,
    happinessRestored: 30,
    energyRestored: 10,
    icon: '🍦',
  },
];

export const RENOVATION_ITEMS = [
  {
    id: 'decor_plant',
    name: 'Bonsai & Succulent Set',
    category: 'decor',
    price: 45,
    description: 'Refreshing desk plants that elevate study oxygen and aesthetic focus.',
    happinessBonus: 10,
    icon: '🪴',
    appliedType: 'plant',
  },
  {
    id: 'decor_fairy_lights',
    name: 'Warm Ambient Fairy Lights',
    category: 'lighting',
    price: 60,
    description: 'Cozy wall fairy string lights for serene midnight revision sessions.',
    happinessBonus: 15,
    icon: '✨',
    appliedType: 'fairyLights',
  },
  {
    id: 'decor_study_lamp',
    name: 'LED Architect Task Lamp',
    category: 'lighting',
    price: 90,
    description: 'Adjustable dual-spectrum desk lamp to reduce eye strain when reading.',
    happinessBonus: 12,
    icon: '💡',
    appliedType: 'lamp',
  },
  {
    id: 'decor_gaming_console',
    name: 'Campus Gaming Station',
    category: 'electronics',
    price: 320,
    description: 'Compact console with wireless controllers for hostel FIFA tournaments with Kwame.',
    happinessBonus: 35,
    icon: '🎮',
    appliedType: 'console',
  },
  {
    id: 'decor_neon_sign',
    name: 'UPSA "Excellence" Neon Light',
    category: 'decor',
    price: 180,
    description: 'Electric cyan neon wall crest glowing over your study desk.',
    happinessBonus: 25,
    icon: '⚡',
    appliedType: 'neon',
  },
  {
    id: 'decor_bookshelf',
    name: 'Hardwood Reference Bookshelf',
    category: 'furniture',
    price: 140,
    description: 'Solid tiered bookshelf stocked with ICA Ghana and IT manuals.',
    happinessBonus: 18,
    icon: '📚',
    appliedType: 'bookshelf',
  },
  {
    id: 'decor_beanbag',
    name: 'Hostel Velvet Bean Bag',
    category: 'furniture',
    price: 110,
    description: 'Ultra-plush lounge seat for relaxing between campus lecture blocks.',
    happinessBonus: 20,
    icon: '🛋️',
    appliedType: 'beanbag',
  },
];

export const TRANSPORT_OPTIONS = [
  {
    id: 'walk',
    name: 'Walk on Foot via University Avenue',
    cost: 0,
    timeMinutes: 12,
    energyChange: -8,
    happinessChange: 2,
    description: 'Take a brisk scenic walk through the campus quad, greeting coursemates.',
    icon: '🚶',
  },
  {
    id: 'scooter',
    name: 'Campus Electric Scooter Rental',
    cost: 10,
    timeMinutes: 4,
    energyChange: -2,
    happinessChange: 12,
    description: 'Zip between lecture halls and hostel gates swiftly on a campus e-scooter.',
    icon: '🛴',
  },
  {
    id: 'trotro',
    name: 'Campus Shuttle / Trotro',
    cost: 5,
    timeMinutes: 6,
    energyChange: 0,
    happinessChange: 5,
    description: 'Catch the frequent UPSA student shuttle van with afrobeats on the radio.',
    icon: '🚐',
  },
  {
    id: 'bolt',
    name: 'Bolt / Uber VIP AC Ride',
    cost: 25,
    timeMinutes: 3,
    energyChange: 2,
    happinessChange: 18,
    description: 'Air-conditioned express private ride directly to the building doorstep.',
    icon: '🚗',
  },
];

export const LIBRARY_CHALLENGE_QUESTIONS = [
  {
    question: 'What is the primary document used in accounting to list ledger balances and test mathematical equality?',
    options: ['Trial Balance', 'Income Statement', 'Audit Voucher', 'Bank Reconciliation'],
    correctIndex: 0,
    subject: 'Accounting',
  },
  {
    question: 'In computer networking, which protocol is responsible for securely transmitting encrypted web pages?',
    options: ['HTTPS', 'FTP', 'SMTP', 'UDP'],
    correctIndex: 0,
    subject: 'Information Technology',
  },
  {
    question: 'The famous "4 Ps" in Marketing consist of Product, Price, Place, and what fourth element?',
    options: ['Promotion', 'Procurement', 'Packaging', 'Profit'],
    correctIndex: 0,
    subject: 'Marketing',
  },
  {
    question: 'What is the term for the maximum amount of output an economy or business firm can produce with full employment?',
    options: ['Potential Output / Capacity', 'Sunk Cost', 'Marginal Deficit', 'Fixed Yield'],
    correctIndex: 0,
    subject: 'Economics & Business',
  },
  {
    question: 'In database management, which SQL keyword is used to retrieve data from a table?',
    options: ['SELECT', 'FETCH', 'PULL', 'GET'],
    correctIndex: 0,
    subject: 'Computing & IT',
  },
];
