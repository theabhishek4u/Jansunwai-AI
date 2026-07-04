import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  state: string;
  district: string;
  parliamentary_constituency: string;
  assembly_constituency: string;
  village_ward?: string;
  pincode: string;
  language_preference: string;
  contribution_score: number;
  avatar_url?: string;
  role: 'citizen' | 'mp';
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  citizen_id: string;
  title: string;
  category: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  village?: string;
  block?: string;
  district: string;
  state: string;
  estimated_beneficiaries: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'ai_processing' | 'duplicate_checked' | 'infra_analyzed' | 'demand_analyzed' | 'under_review' | 'accepted' | 'rejected' | 'planned' | 'completed';
  ai_score_completeness?: number;
  ai_score_impact?: 'low' | 'medium' | 'high' | 'critical' | 'Low' | 'Medium' | 'High' | 'Critical';
  ai_score_location_verified: boolean;
  ai_score_photo_verified: boolean;
  ai_score_confidence?: number;
  duplicate_of_id?: string | null;
  supporters?: number;
  estimated_cost_lakhs?: number;
  created_at: string;
  updated_at: string;
}

export interface MediaAttachment {
  id: string;
  suggestion_id: string;
  file_url: string;
  file_type: 'image' | 'video' | 'voice' | 'pdf';
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  suggestion_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: 'top_contributor' | 'community_leader' | 'verified_citizen' | 'problem_solver';
  earned_at: string;
}

// Helper: days ago
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// Villages with coordinates in Varanasi constituency
const VILLAGES = [
  { name: 'Sigra', block: 'Kashi Vidyapeeth', lat: 25.3176, lng: 82.9739 },
  { name: 'Ramnagar', block: 'Pindra', lat: 25.2700, lng: 83.0300 },
  { name: 'Sarnath', block: 'Kashi Vidyapeeth', lat: 25.3800, lng: 83.0225 },
  { name: 'Cholapur', block: 'Cholapur', lat: 25.4100, lng: 82.9100 },
  { name: 'Harahua', block: 'Harahua', lat: 25.2200, lng: 82.8900 },
  { name: 'Sevapuri', block: 'Sevapuri', lat: 25.3500, lng: 83.0900 },
];

// Citizen profiles
const citizenIds = ['citizen-123', 'citizen-201', 'citizen-302', 'citizen-403', 'citizen-504', 'citizen-605'];

// In-Memory Arrays
let profiles: Profile[] = [
  {
    id: 'citizen-123',
    full_name: 'Aarav Sharma',
    phone: '+91 9876543210',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Varanasi Cantonment',
    village_ward: 'Ward 12 - Sigra',
    pincode: '221002',
    language_preference: 'hi',
    contribution_score: 120,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    role: 'citizen',
    created_at: daysAgo(30),
    updated_at: daysAgo(30)
  },
  {
    id: 'citizen-201',
    full_name: 'Priya Gupta',
    phone: '+91 9988776655',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Varanasi North',
    village_ward: 'Ramnagar',
    pincode: '221008',
    language_preference: 'hi',
    contribution_score: 85,
    role: 'citizen',
    created_at: daysAgo(25),
    updated_at: daysAgo(25)
  },
  {
    id: 'citizen-302',
    full_name: 'Rajesh Yadav',
    phone: '+91 8877665544',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Varanasi South',
    village_ward: 'Sarnath',
    pincode: '221007',
    language_preference: 'hi',
    contribution_score: 60,
    role: 'citizen',
    created_at: daysAgo(20),
    updated_at: daysAgo(20)
  },
  {
    id: 'citizen-403',
    full_name: 'Sunita Devi',
    phone: '+91 7766554433',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Rohaniya',
    village_ward: 'Cholapur',
    pincode: '221106',
    language_preference: 'hi',
    contribution_score: 40,
    role: 'citizen',
    created_at: daysAgo(15),
    updated_at: daysAgo(15)
  },
  {
    id: 'citizen-504',
    full_name: 'Mohammad Irfan',
    phone: '+91 6655443322',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Sevapuri',
    village_ward: 'Harahua',
    pincode: '221105',
    language_preference: 'urd',
    contribution_score: 95,
    role: 'citizen',
    created_at: daysAgo(18),
    updated_at: daysAgo(18)
  },
  {
    id: 'citizen-605',
    full_name: 'Anita Kumari',
    phone: '+91 5544332211',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Sevapuri',
    village_ward: 'Sevapuri',
    pincode: '221104',
    language_preference: 'hi',
    contribution_score: 70,
    role: 'citizen',
    created_at: daysAgo(12),
    updated_at: daysAgo(12)
  },
  // MP Profile
  {
    id: 'mp-varanasi',
    full_name: 'Dr. Vikram Singh',
    phone: '+91 9999888877',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    parliamentary_constituency: 'Varanasi',
    assembly_constituency: 'Varanasi Cantonment',
    village_ward: 'Secretariat',
    pincode: '221001',
    language_preference: 'en',
    contribution_score: 0,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    role: 'mp',
    created_at: daysAgo(60),
    updated_at: daysAgo(1)
  }
];

let suggestions: Suggestion[] = [
  // 1 — PHC Water (Sigra) — under_review
  {
    id: 'sugg-1', citizen_id: 'citizen-123',
    title: 'Primary Health Center lacks clean drinking water facility',
    category: 'PHC', description: 'The Primary Health Center in our block has no clean drinking water. Patients and doctors have to walk 500m to get drinking water from a public handpump. During summers, heat stroke cases increase due to lack of water inside the PHC.',
    location_lat: 25.3176, location_lng: 82.9739, village: 'Sigra', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 1200,
    urgency: 'high', status: 'under_review',
    ai_score_completeness: 88, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 94, supporters: 342, estimated_cost_lakhs: 15,
    created_at: daysAgo(10), updated_at: daysAgo(5)
  },
  // 2 — Road (Sigra) — completed
  {
    id: 'sugg-2', citizen_id: 'citizen-123',
    title: 'Damaged main road connecting Varanasi to local village school',
    category: 'Road', description: 'The main connecting road has developed deep potholes. During rain, it overflows with mud. Multiple minor accidents have happened. Children cannot cycle to school safely.',
    location_lat: 25.3210, location_lng: 82.9800, village: 'Sigra', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 3000,
    urgency: 'critical', status: 'completed',
    ai_score_completeness: 95, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 98, supporters: 891, estimated_cost_lakhs: 45,
    created_at: daysAgo(20), updated_at: daysAgo(1)
  },
  // 3 — School (Ramnagar) — under_review
  {
    id: 'sugg-3', citizen_id: 'citizen-201',
    title: 'No primary school within 5km of Ramnagar village',
    category: 'School', description: 'Children from Ramnagar and 3 nearby hamlets walk over 5km daily to attend the nearest government primary school. During monsoon, attendance drops to 30%. We need a primary school with at least 4 classrooms.',
    location_lat: 25.2700, location_lng: 83.0300, village: 'Ramnagar', block: 'Pindra',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 4500,
    urgency: 'critical', status: 'under_review',
    ai_score_completeness: 92, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 90, supporters: 1245, estimated_cost_lakhs: 120,
    created_at: daysAgo(15), updated_at: daysAgo(3)
  },
  // 4 — Hospital (Ramnagar) — submitted
  {
    id: 'sugg-4', citizen_id: 'citizen-201',
    title: 'Upgrade Community Health Center to full hospital',
    category: 'Hospital', description: 'The existing CHC in Ramnagar lacks an operation theater, maternity ward, and X-ray machine. Serious patients are referred to Varanasi city, 28km away. Last month two pregnant women delivered on the way to hospital.',
    location_lat: 25.2750, location_lng: 83.0350, village: 'Ramnagar', block: 'Pindra',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 18000,
    urgency: 'critical', status: 'submitted',
    ai_score_completeness: 94, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 96, supporters: 2100, estimated_cost_lakhs: 350,
    created_at: daysAgo(8), updated_at: daysAgo(8)
  },
  // 5 — Water Supply (Sarnath) — planned
  {
    id: 'sugg-5', citizen_id: 'citizen-302',
    title: 'Install overhead water tank and piped water supply in Sarnath ward',
    category: 'Water Supply', description: 'Over 800 families in Sarnath rely on a single hand pump that runs dry by April. Women walk 2km to the Varuna river for water. We urgently need an overhead tank with piped distribution to all homes.',
    location_lat: 25.3800, location_lng: 83.0225, village: 'Sarnath', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 5200,
    urgency: 'high', status: 'planned',
    ai_score_completeness: 86, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 88, supporters: 780, estimated_cost_lakhs: 85,
    created_at: daysAgo(22), updated_at: daysAgo(4)
  },
  // 6 — Street Lights (Sarnath) — under_review
  {
    id: 'sugg-6', citizen_id: 'citizen-302',
    title: 'Install 120 solar street lights along Sarnath-Varanasi connecting road',
    category: 'Street Lights', description: 'The 4km stretch from Sarnath to Varanasi city has zero street lights. Chain snatching and road accidents are common after dark. Students returning from coaching classes feel unsafe.',
    location_lat: 25.3750, location_lng: 83.0100, village: 'Sarnath', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 8000,
    urgency: 'high', status: 'under_review',
    ai_score_completeness: 82, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 85, supporters: 560, estimated_cost_lakhs: 35,
    created_at: daysAgo(12), updated_at: daysAgo(6)
  },
  // 7 — Drainage (Cholapur) — submitted
  {
    id: 'sugg-7', citizen_id: 'citizen-403',
    title: 'Open drainage system causing waterlogging and disease in Cholapur',
    category: 'Drainage', description: 'Cholapur has open drains that overflow during monsoon. Stagnant water breeds mosquitoes causing dengue every year. Last year 45 dengue cases were reported. Need covered drainage and stormwater system.',
    location_lat: 25.4100, location_lng: 82.9100, village: 'Cholapur', block: 'Cholapur',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 6000,
    urgency: 'high', status: 'submitted',
    ai_score_completeness: 80, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 82, supporters: 430, estimated_cost_lakhs: 55,
    created_at: daysAgo(7), updated_at: daysAgo(7)
  },
  // 8 — Women Safety (Cholapur) — submitted
  {
    id: 'sugg-8', citizen_id: 'citizen-403',
    title: 'Establish women helpdesk and CCTV at Cholapur bus stop',
    category: "Women's Safety", description: 'Cholapur bus stop is the main transit point for women commuters. Multiple harassment incidents reported. We need a police helpdesk, CCTV cameras, and proper lighting at the bus stop and surrounding 500m area.',
    location_lat: 25.4050, location_lng: 82.9150, village: 'Cholapur', block: 'Cholapur',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 3500,
    urgency: 'critical', status: 'submitted',
    ai_score_completeness: 78, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 80, supporters: 620, estimated_cost_lakhs: 25,
    created_at: daysAgo(5), updated_at: daysAgo(5)
  },
  // 9 — Agriculture (Harahua) — under_review
  {
    id: 'sugg-9', citizen_id: 'citizen-504',
    title: 'Build cold storage facility for farmers in Harahua block',
    category: 'Agriculture', description: 'Harahua produces 5000 tonnes of vegetables annually but farmers lose 30% to spoilage due to zero cold storage. The nearest cold storage is 40km away. A facility here would save ₹3 crore annually for 2000+ farmers.',
    location_lat: 25.2200, location_lng: 82.8900, village: 'Harahua', block: 'Harahua',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 12000,
    urgency: 'high', status: 'under_review',
    ai_score_completeness: 91, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 93, supporters: 1850, estimated_cost_lakhs: 200,
    created_at: daysAgo(14), updated_at: daysAgo(2)
  },
  // 10 — Road (Harahua) — planned
  {
    id: 'sugg-10', citizen_id: 'citizen-504',
    title: 'Widen and blacktop Harahua-Varanasi connecting road (12km)',
    category: 'Road', description: 'The main road connecting Harahua to Varanasi is a single-lane dirt road. Trucks carrying produce get stuck in mud during monsoon. Ambulances take 90 minutes for a 12km journey. Widening to two-lane blacktop road is essential.',
    location_lat: 25.2250, location_lng: 82.9000, village: 'Harahua', block: 'Harahua',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 25000,
    urgency: 'critical', status: 'planned',
    ai_score_completeness: 96, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 97, supporters: 3200, estimated_cost_lakhs: 800,
    created_at: daysAgo(25), updated_at: daysAgo(3)
  },
  // 11 — Electricity (Sevapuri) — submitted
  {
    id: 'sugg-11', citizen_id: 'citizen-605',
    title: 'Electrify 3 hamlets in Sevapuri block still without power',
    category: 'Electricity', description: 'Three hamlets (Basahia, Tendua, Khajuri) with 180 households have no electricity connection. Children study by kerosene lamps. Government Saubhagya scheme missed these hamlets. Need transformer installation and wiring.',
    location_lat: 25.3500, location_lng: 83.0900, village: 'Sevapuri', block: 'Sevapuri',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 1100,
    urgency: 'critical', status: 'submitted',
    ai_score_completeness: 85, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 87, supporters: 180, estimated_cost_lakhs: 40,
    created_at: daysAgo(6), updated_at: daysAgo(6)
  },
  // 12 — Bridge (Sevapuri) — rejected
  {
    id: 'sugg-12', citizen_id: 'citizen-605',
    title: 'Construct small bridge over Varuna nala near Sevapuri',
    category: 'Bridge', description: 'A seasonal nala floods during monsoon cutting off Sevapuri from the main road for 3-4 months. School children cross knee-deep water. A 30m RCC bridge would solve this permanently.',
    location_lat: 25.3550, location_lng: 83.0850, village: 'Sevapuri', block: 'Sevapuri',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 3000,
    urgency: 'high', status: 'rejected',
    ai_score_completeness: 75, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 78, supporters: 290, estimated_cost_lakhs: 60,
    created_at: daysAgo(30), updated_at: daysAgo(10)
  },
  // 13 — Park (Sigra) — completed
  {
    id: 'sugg-13', citizen_id: 'citizen-123',
    title: 'Develop children park and open gym in Sigra ward',
    category: 'Park', description: 'Sigra ward has no public park or playground. Children play on roads risking accidents. Senior citizens have no walking space. Request development of 2-acre park with playground equipment, walking track and open gym.',
    location_lat: 25.3200, location_lng: 82.9780, village: 'Sigra', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 5000,
    urgency: 'medium', status: 'completed',
    ai_score_completeness: 82, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 84, supporters: 420, estimated_cost_lakhs: 30,
    created_at: daysAgo(45), updated_at: daysAgo(2)
  },
  // 14 — Internet (Ramnagar) — submitted
  {
    id: 'sugg-14', citizen_id: 'citizen-201',
    title: 'Install BharatNet fiber optic broadband in Ramnagar panchayat',
    category: 'Internet', description: 'Ramnagar panchayat bhawan, school, and PHC have no internet connectivity. Students cannot access digital education. Telemedicine is impossible. BharatNet fiber was sanctioned but never installed.',
    location_lat: 25.2720, location_lng: 83.0280, village: 'Ramnagar', block: 'Pindra',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 8000,
    urgency: 'medium', status: 'submitted',
    ai_score_completeness: 79, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 81, supporters: 310, estimated_cost_lakhs: 12,
    created_at: daysAgo(4), updated_at: daysAgo(4)
  },
  // 15 — Waste Management (Sarnath) — under_review
  {
    id: 'sugg-15', citizen_id: 'citizen-302',
    title: 'Establish solid waste processing unit near Sarnath tourist zone',
    category: 'Waste Management', description: 'Sarnath attracts 3 million tourists annually but has no waste processing. Garbage is dumped 1km from the Buddhist heritage site. We need a composting and recycling unit with daily collection route for 12 wards.',
    location_lat: 25.3830, location_lng: 83.0250, village: 'Sarnath', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 15000,
    urgency: 'medium', status: 'under_review',
    ai_score_completeness: 87, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 89, supporters: 650, estimated_cost_lakhs: 75,
    created_at: daysAgo(18), updated_at: daysAgo(5)
  },
  // 16 — Skill Center (Cholapur) — submitted
  {
    id: 'sugg-16', citizen_id: 'citizen-403',
    title: 'Open ITI/Skill Development Center for youth in Cholapur',
    category: 'Skill Center', description: 'Cholapur block has 40% youth unemployment. Nearest ITI is 35km away. Need a skill center offering courses in electrician, plumbing, computer basics, and tailoring. Government building available for conversion.',
    location_lat: 25.4080, location_lng: 82.9120, village: 'Cholapur', block: 'Cholapur',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 2500,
    urgency: 'medium', status: 'submitted',
    ai_score_completeness: 83, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 85, supporters: 380, estimated_cost_lakhs: 50,
    created_at: daysAgo(9), updated_at: daysAgo(9)
  },
  // 17 — PHC (Harahua) — submitted
  {
    id: 'sugg-17', citizen_id: 'citizen-504',
    title: 'Establish new Primary Health Center in Harahua east',
    category: 'PHC', description: 'Eastern Harahua (population 22,000) has no health facility within 8km. Snake bites, farm injuries, and childbirth complications become life-threatening due to travel distance. Need a PHC with 2 doctors and basic lab.',
    location_lat: 25.2180, location_lng: 82.9050, village: 'Harahua', block: 'Harahua',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 22000,
    urgency: 'critical', status: 'submitted',
    ai_score_completeness: 90, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 92, supporters: 1650, estimated_cost_lakhs: 150,
    created_at: daysAgo(3), updated_at: daysAgo(3)
  },
  // 18 — Environment (Sarnath) — submitted
  {
    id: 'sugg-18', citizen_id: 'citizen-302',
    title: 'Plant 5000 trees along Varuna river bank to prevent soil erosion',
    category: 'Environment', description: 'The Varuna river bank near Sarnath is eroding 2-3 meters per year. Three houses collapsed last monsoon. Tree plantation along 5km stretch will stabilize soil, improve air quality, and create a green corridor for the Buddhist tourism circuit.',
    location_lat: 25.3780, location_lng: 83.0150, village: 'Sarnath', block: 'Kashi Vidyapeeth',
    district: 'Varanasi', state: 'Uttar Pradesh', estimated_beneficiaries: 10000,
    urgency: 'medium', status: 'submitted',
    ai_score_completeness: 84, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 86, supporters: 520, estimated_cost_lakhs: 18,
    created_at: daysAgo(11), updated_at: daysAgo(11)
  }
];

let mediaAttachments: MediaAttachment[] = [
  { id: 'media-1', suggestion_id: 'sugg-1', file_url: 'https://images.unsplash.com/photo-1590247813693-5541f1c609fd?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(10) },
  { id: 'media-2', suggestion_id: 'sugg-2', file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(20) },
  { id: 'media-3', suggestion_id: 'sugg-4', file_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(8) },
  { id: 'media-4', suggestion_id: 'sugg-7', file_url: 'https://images.unsplash.com/photo-1584463699057-a0c20e5e8d56?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(7) },
  { id: 'media-5', suggestion_id: 'sugg-9', file_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(14) },
  { id: 'media-6', suggestion_id: 'sugg-10', file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(25) },
];

let timelineEvents: TimelineEvent[] = [
  { id: 't-1', suggestion_id: 'sugg-1', status: 'submitted', notes: 'Suggestion successfully submitted by citizen.', created_at: daysAgo(10) },
  { id: 't-2', suggestion_id: 'sugg-1', status: 'ai_processing', notes: 'Gemini completed initial validation and scoring.', created_at: daysAgo(10) },
  { id: 't-3', suggestion_id: 'sugg-1', status: 'duplicate_checked', notes: 'Duplicate verification complete. No duplicate reports found.', created_at: daysAgo(9) },
  { id: 't-4', suggestion_id: 'sugg-1', status: 'under_review', notes: 'Forwarded to Varanasi Constituency Planning team for review.', created_at: daysAgo(5) },
  { id: 't-5', suggestion_id: 'sugg-2', status: 'submitted', notes: 'Suggestion submitted.', created_at: daysAgo(20) },
  { id: 't-6', suggestion_id: 'sugg-2', status: 'under_review', notes: 'Reviewed by MP. Sent to Public Works Department (PWD).', created_at: daysAgo(15) },
  { id: 't-7', suggestion_id: 'sugg-2', status: 'planned', notes: 'Budget sanctioned for road repairs under Rural Connect Scheme.', created_at: daysAgo(10) },
  { id: 't-8', suggestion_id: 'sugg-2', status: 'completed', notes: 'Road construction completed. Repaired 1.2km stretch leading to Sigra Primary High School.', created_at: daysAgo(1) },
  { id: 't-9', suggestion_id: 'sugg-5', status: 'submitted', notes: 'Submitted by citizen.', created_at: daysAgo(22) },
  { id: 't-10', suggestion_id: 'sugg-5', status: 'planned', notes: 'Approved under Jal Jeevan Mission. Budget sanctioned.', created_at: daysAgo(4) },
  { id: 't-11', suggestion_id: 'sugg-10', status: 'submitted', notes: 'Submitted.', created_at: daysAgo(25) },
  { id: 't-12', suggestion_id: 'sugg-10', status: 'planned', notes: 'Approved under PMGSY Phase III. ₹8 Cr sanctioned by Ministry of Rural Development.', created_at: daysAgo(3) },
  { id: 't-13', suggestion_id: 'sugg-13', status: 'submitted', notes: 'Submitted.', created_at: daysAgo(45) },
  { id: 't-14', suggestion_id: 'sugg-13', status: 'completed', notes: 'Park inaugurated by MP. 2-acre green space with children playground, open gym, and walking track.', created_at: daysAgo(2) },
];

let userBadges: UserBadge[] = [
  { id: 'badge-1', user_id: 'citizen-123', badge_type: 'verified_citizen', earned_at: daysAgo(28) },
  { id: 'badge-2', user_id: 'citizen-123', badge_type: 'problem_solver', earned_at: daysAgo(1) },
  { id: 'badge-3', user_id: 'citizen-504', badge_type: 'verified_citizen', earned_at: daysAgo(16) },
  { id: 'badge-4', user_id: 'citizen-504', badge_type: 'top_contributor', earned_at: daysAgo(5) },
];

// DB Operations implementation
export const mockDb = {
  getProfile: async (id: string) => {
    return profiles.find(p => p.id === id) || null;
  },
  upsertProfile: async (profile: Partial<Profile> & { id: string }) => {
    const existingIdx = profiles.findIndex(p => p.id === profile.id);
    const now = new Date().toISOString();
    if (existingIdx > -1) {
      profiles[existingIdx] = { ...profiles[existingIdx], ...profile, updated_at: now } as Profile;
      return profiles[existingIdx];
    } else {
      const newProfile: Profile = {
        id: profile.id, full_name: profile.full_name || 'Anonymous', phone: profile.phone,
        state: profile.state || '', district: profile.district || '',
        parliamentary_constituency: profile.parliamentary_constituency || '',
        assembly_constituency: profile.assembly_constituency || '',
        village_ward: profile.village_ward, pincode: profile.pincode || '',
        language_preference: profile.language_preference || 'en',
        contribution_score: profile.contribution_score || 0, avatar_url: profile.avatar_url,
        role: profile.role || 'citizen', created_at: now, updated_at: now
      };
      profiles.push(newProfile);
      return newProfile;
    }
  },
  getSuggestions: async (filters?: { citizen_id?: string; category?: string; district?: string }) => {
    let list = [...suggestions];
    if (filters?.citizen_id) list = list.filter(s => s.citizen_id === filters.citizen_id);
    if (filters?.category) list = list.filter(s => s.category === filters.category);
    if (filters?.district) list = list.filter(s => s.district.toLowerCase() === filters.district?.toLowerCase());
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getAllSuggestions: async () => {
    return [...suggestions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getSuggestionById: async (id: string) => {
    return suggestions.find(s => s.id === id) || null;
  },
  createSuggestion: async (sugg: Omit<Suggestion, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    const now = new Date().toISOString();
    const id = sugg.id || `sugg-${uuidv4()}`;
    const newSuggestion: Suggestion = { ...sugg, id, created_at: now, updated_at: now };
    suggestions.push(newSuggestion);
    timelineEvents.push({ id: `t-${uuidv4()}`, suggestion_id: id, status: sugg.status || 'submitted', notes: 'Development suggestion successfully registered.', created_at: now });
    return newSuggestion;
  },
  updateSuggestionStatus: async (id: string, status: string) => {
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx > -1) {
      suggestions[idx].status = status as Suggestion['status'];
      suggestions[idx].updated_at = new Date().toISOString();
      return suggestions[idx];
    }
    return null;
  },
  addMediaAttachment: async (att: Omit<MediaAttachment, 'id' | 'created_at'>) => {
    const newAtt: MediaAttachment = { ...att, id: `media-${uuidv4()}`, created_at: new Date().toISOString() };
    mediaAttachments.push(newAtt);
    return newAtt;
  },
  getMediaAttachments: async (suggestionId: string) => {
    return mediaAttachments.filter(m => m.suggestion_id === suggestionId);
  },
  getTimelineEvents: async (suggestionId: string) => {
    return timelineEvents.filter(t => t.suggestion_id === suggestionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },
  addTimelineEvent: async (event: Omit<TimelineEvent, 'id' | 'created_at'>) => {
    const newEvent: TimelineEvent = { ...event, id: `t-${uuidv4()}`, created_at: new Date().toISOString() };
    timelineEvents.push(newEvent);
    const suggIdx = suggestions.findIndex(s => s.id === event.suggestion_id);
    if (suggIdx > -1 && event.status) {
      suggestions[suggIdx].status = event.status as Suggestion['status'];
      suggestions[suggIdx].updated_at = new Date().toISOString();
    }
    return newEvent;
  },
  getUserBadges: async (userId: string) => {
    return userBadges.filter(b => b.user_id === userId);
  },
  addBadge: async (userId: string, badgeType: UserBadge['badge_type']) => {
    const existing = userBadges.find(b => b.user_id === userId && b.badge_type === badgeType);
    if (existing) return existing;
    const newBadge: UserBadge = { id: `badge-${uuidv4()}`, user_id: userId, badge_type: badgeType, earned_at: new Date().toISOString() };
    userBadges.push(newBadge);
    await mockDb.incrementScore(userId, 50);
    return newBadge;
  },
  incrementScore: async (userId: string, points: number) => {
    const profile = profiles.find(p => p.id === userId);
    if (profile) { profile.contribution_score += points; profile.updated_at = new Date().toISOString(); return profile.contribution_score; }
    return 0;
  },
  getStats: async () => {
    const allSugg = suggestions;
    const citizenCount = profiles.filter(p => p.role === 'citizen').length;
    const totalSuggestions = allSugg.length;
    const highPriority = allSugg.filter(s => s.urgency === 'critical' || s.urgency === 'high').length;
    const activeProjects = allSugg.filter(s => s.status === 'planned' || s.status === 'under_review').length;
    const completed = allSugg.filter(s => s.status === 'completed').length;
    const pendingReview = allSugg.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
    const totalBeneficiaries = allSugg.reduce((sum, s) => sum + s.estimated_beneficiaries, 0);
    const totalCostLakhs = allSugg.reduce((sum, s) => sum + (s.estimated_cost_lakhs || 0), 0);
    return { citizenCount, totalSuggestions, highPriority, activeProjects, completed, pendingReview, totalBeneficiaries, totalCostLakhs };
  },

  // ADMIN OPERATIONS
  getPrompts: async () => {
    return promptTemplates;
  },
  updatePrompt: async (id: string, content: string) => {
    const p = promptTemplates.find(pr => pr.id === id);
    if (p) {
      p.content = content;
      p.updatedAt = new Date().toISOString();
      await mockDb.addAuditLog('System', `Modified AI Prompt template: ${p.name}`);
      return p;
    }
    return null;
  },
  getDatasets: async () => {
    return datasetRecords;
  },
  addDataset: async (dataset: Omit<DatasetRecord, 'id' | 'uploadedAt'>) => {
    const newRecord: DatasetRecord = {
      ...dataset,
      id: `ds-${uuidv4().substring(0, 8)}`,
      uploadedAt: new Date().toISOString()
    };
    datasetRecords.push(newRecord);
    await mockDb.addAuditLog('System', `Uploaded and indexed public dataset: ${dataset.name}`);
    return newRecord;
  },
  getAuditLogs: async () => {
    return [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addAuditLog: async (adminName: string, action: string) => {
    const log: AuditLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      adminName,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1'
    };
    auditLogs.push(log);
    return log;
  },
  getMps: async () => {
    return profiles.filter(p => p.role === 'mp');
  },
  updateMpStatus: async (id: string, status: 'active' | 'suspended') => {
    const mp = profiles.find(p => p.id === id && p.role === 'mp');
    if (mp) {
      // simulate suspension state by updating in profiles or logs
      await mockDb.addAuditLog('System', `Admin updated status for MP ${mp.full_name} to ${status}`);
      return mp;
    }
    return null;
  }
};

// Data Structures for admin management
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  updatedAt: string;
}

export interface DatasetRecord {
  id: string;
  name: string;
  category: string;
  fileSize: string;
  format: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

let promptTemplates: PromptTemplate[] = [
  {
    id: 'p-1',
    name: 'MP Copilot Prompt',
    category: 'MP Assistant',
    content: 'You are an AI Copilot for an Indian MP managing Varanasi constituency. The MP asked: "{question}". Respond with a structured summary, data arrays, and recommended next actions.',
    updatedAt: daysAgo(5)
  },
  {
    id: 'p-2',
    name: 'Priority Engine Prompt',
    category: 'Analytics',
    content: 'Analyze development suggestions. Calculate priority scores based on: urgency (25%), citizen supporter count (25%), completeness metric (25%), and population impact (25%). Output JSON rankings.',
    updatedAt: daysAgo(5)
  },
  {
    id: 'p-3',
    name: 'Budget Planner Prompt',
    category: 'Budget',
    content: 'Distribute a total budget of {budget} Crore across the following suggestion list. Rank categories proportionally by average urgency score and population impact.',
    updatedAt: daysAgo(10)
  },
  {
    id: 'p-4',
    name: 'Vision Analysis Prompt',
    category: 'Image Verification',
    content: 'Analyze the submitted photo. Verify if it shows actual infrastructural damage matching the category (Road/PHC/School). Return confidence score (0-100) and flag fraudulent images.',
    updatedAt: daysAgo(3)
  }
];

let datasetRecords: DatasetRecord[] = [
  { id: 'ds-1', name: 'Varanasi Census Data 2011', category: 'Census', fileSize: '12.4 MB', format: 'CSV', uploadedAt: daysAgo(20) },
  { id: 'ds-2', name: 'Primary Healthcare Center Deficits Registry', category: 'Health Centers', fileSize: '2.8 MB', format: 'JSON', uploadedAt: daysAgo(15) },
  { id: 'ds-3', name: 'NHAI National Highway Mapping - UP East', category: 'Road Network', fileSize: '45.1 MB', format: 'GeoJSON', uploadedAt: daysAgo(12) },
  { id: 'ds-4', name: 'Ministry of Education - Primary School Deficits', category: 'Education Data', fileSize: '8.4 MB', format: 'Excel', uploadedAt: daysAgo(8) }
];

let auditLogs: AuditLog[] = [
  { id: 'log-1', adminName: 'Admin Operations', action: 'System online. All constituency listeners active.', timestamp: daysAgo(4), ipAddress: '127.0.0.1' },
  { id: 'log-2', adminName: 'Admin Operations', action: 'Configured Gemini 2.5 Flash as active model.', timestamp: daysAgo(3), ipAddress: '192.168.1.10' },
  { id: 'log-3', adminName: 'Admin Operations', action: 'Synchronized Jal Jeevan Mission dataset.', timestamp: daysAgo(2), ipAddress: '192.168.1.10' }
];

