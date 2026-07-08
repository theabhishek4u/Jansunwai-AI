import { v4 as uuidv4 } from 'uuid';

export interface Department {
  id: string;
  name: string;
  email: string;
  password?: string;
  officer: string;
  category: string;
  status: 'active' | 'suspended';
  verification_status: 'verified' | 'unverified';
  created_at: string;
}

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
  aadhaar_number?: string;
  verification_status?: 'incomplete' | 'pending' | 'verified' | 'rejected';
}

export interface Suggestion {
  id: string;
  complaint_number?: string;
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
  supporters?: number; // legacy alias
  support_count: number;
  consensus_score: number;
  duplicate_group_id?: string | null;
  estimated_cost_lakhs?: number;
  created_at: string;
  updated_at: string;
}

export interface ProposalSupport {
  id: string;
  proposal_id: string;
  user_id: string;
  supported_at: string;
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

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Helper: days ago
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// Villages with coordinates in Lucknow constituency
const VILLAGES = [
  { name: 'Hazratganj', block: 'Lucknow Central', lat: 26.8500, lng: 80.9499 },
  { name: 'Gomti Nagar', block: 'Lucknow East', lat: 26.8600, lng: 80.9700 },
  { name: 'Alambagh', block: 'Lucknow Cantonment', lat: 26.8100, lng: 80.9000 },
  { name: 'Chowk', block: 'Lucknow West', lat: 26.8650, lng: 80.9150 },
  { name: 'Indira Nagar', block: 'Lucknow North', lat: 26.8900, lng: 80.9900 },
  { name: 'Aminabad', block: 'Lucknow Central', lat: 26.8400, lng: 80.9280 },
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
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow Central',
    village_ward: 'Hazratganj',
    pincode: '226001',
    language_preference: 'hi',
    contribution_score: 120,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    role: 'citizen',
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
    verification_status: 'verified'
  },
  {
    id: 'citizen-201',
    full_name: 'Priya Gupta',
    phone: '+91 9988776655',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow East',
    village_ward: 'Gomti Nagar',
    pincode: '226010',
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
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow North',
    village_ward: 'Indira Nagar',
    pincode: '226016',
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
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow Central',
    village_ward: 'Mahanagar',
    pincode: '226006',
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
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Sarojini Nagar',
    village_ward: 'Ashiyana',
    pincode: '226012',
    language_preference: 'urd',
    contribution_score: 95,
    role: 'citizen',
    created_at: daysAgo(18),
    updated_at: daysAgo(18),
    verification_status: 'verified'
  },
  {
    id: 'citizen-605',
    full_name: 'Anita Kumari',
    phone: '+91 5544332211',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow North',
    village_ward: 'Jankipuram',
    pincode: '226021',
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
    district: 'Lucknow',
    parliamentary_constituency: 'Lucknow',
    assembly_constituency: 'Lucknow Central',
    village_ward: 'Secretariat',
    pincode: '226001',
    language_preference: 'en',
    contribution_score: 0,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    role: 'mp',
    created_at: daysAgo(60),
    updated_at: daysAgo(1)
  }
];

let suggestions: Suggestion[] = [
  // 1 — Road (Hazratganj) — under_review
  {
    id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-123',
    title: 'Pothole clearance and resurfacing of Hazratganj Main Market road',
    category: 'Road', description: 'Hazratganj Main Market road has developed severe cracks and potholes near the Cathedral School crossing, causing massive gridlocks during peak hours and posing safety hazards for two-wheelers.',
    location_lat: 26.8500, location_lng: 80.9499, village: 'Hazratganj', block: 'Lucknow Central',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 12000,
    urgency: 'high', status: 'under_review',
    ai_score_completeness: 88, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 94, supporters: 486, estimated_cost_lakhs: 25,
    created_at: daysAgo(10), updated_at: daysAgo(5)
  },
  // 2 — Drainage (Gomti Nagar) — planned
  {
    id: 'f2a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-123',
    title: 'Waterlogging mitigation near Gomti Nagar railway station underpass',
    category: 'Drainage', description: 'During heavy rainfall, the underpass near Gomti Nagar railway station collects up to 3 feet of water due to clogged storm drains. This cuts off local transport routes to Vibhuti Khand.',
    location_lat: 26.8600, location_lng: 80.9700, village: 'Gomti Nagar', block: 'Lucknow East',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 8500,
    urgency: 'critical', status: 'planned',
    ai_score_completeness: 92, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 96, supporters: 624, estimated_cost_lakhs: 45,
    created_at: daysAgo(20), updated_at: daysAgo(1)
  },
  // 3 — School (Alambagh) — submitted
  {
    id: 'f3a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-201',
    title: 'Expansion and classroom extension of Alambagh Government Primary School',
    category: 'School', description: 'The existing government school in Alambagh ward has only two functional classrooms for over 180 children. We need a classroom block addition to accommodate classes 1 to 5 comfortably.',
    location_lat: 26.8100, location_lng: 80.9000, village: 'Alambagh', block: 'Lucknow Cantonment',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 600,
    urgency: 'medium', status: 'submitted',
    ai_score_completeness: 80, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 84, supporters: 142, estimated_cost_lakhs: 35,
    created_at: daysAgo(15), updated_at: daysAgo(3)
  },
  // 4 — PHC (Chowk) — under_review
  {
    id: 'f4a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-201',
    title: 'Upgrading the local PHC in Chowk with basic diagnostics lab',
    category: 'PHC', description: 'The primary health center in Old Lucknow (Chowk) handles over 300 patients daily but lacks basic blood test and digital X-ray facilities, requiring patients to travel to King George Medical University.',
    location_lat: 26.8650, location_lng: 80.9150, village: 'Chowk', block: 'Lucknow West',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 25000,
    urgency: 'high', status: 'under_review',
    ai_score_completeness: 89, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 91, supporters: 812, estimated_cost_lakhs: 60,
    created_at: daysAgo(8), updated_at: daysAgo(8)
  },
  // 5 — Water Supply (Indira Nagar) — planned
  {
    id: 'f5a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-302',
    title: 'Piped drinking water extension and overhead tank in Indira Nagar Sector 14',
    category: 'Water Supply', description: 'Over 450 households in Sector 14 Indira Nagar experience low water pressure during summers. Installing an overhead tank with an auxiliary pump will solve the water deficit.',
    location_lat: 26.8900, location_lng: 80.9900, village: 'Indira Nagar', block: 'Lucknow North',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 5500,
    urgency: 'medium', status: 'planned',
    ai_score_completeness: 86, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 88, supporters: 320, estimated_cost_lakhs: 50,
    created_at: daysAgo(22), updated_at: daysAgo(4)
  },
  // 6 — Street Lights (Aminabad) — completed
  {
    id: 'f6a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-302',
    title: 'Installation of high-mast LED solar street lights in Aminabad bazaar lane',
    category: 'Street Lights', description: 'The main shopping corridors and narrow bypass lanes of Aminabad have multiple dark patches due to non-functional sodium lamps, causing safety concerns for women shoppers after dark.',
    location_lat: 26.8400, location_lng: 80.9280, village: 'Aminabad', block: 'Lucknow Central',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 15000,
    urgency: 'medium', status: 'completed',
    ai_score_completeness: 84, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 82, supporters: 512, estimated_cost_lakhs: 18,
    created_at: daysAgo(12), updated_at: daysAgo(6)
  },
  // 7 — Waste Management (Mahanagar) — under_review
  {
    id: 'f7a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-403',
    title: 'Setting up localized solid waste composting unit in Mahanagar',
    category: 'Waste Management', description: 'Establishment of a localized organic waste converter in Mahanagar to process community kitchen and garden waste, preventing dumping in local parks and open lands.',
    location_lat: 26.8750, location_lng: 80.9500, village: 'Mahanagar', block: 'Lucknow Central',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 9000,
    urgency: 'medium', status: 'under_review',
    ai_score_completeness: 82, ai_score_impact: 'Medium', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 85, supporters: 245, estimated_cost_lakhs: 22,
    created_at: daysAgo(7), updated_at: daysAgo(7)
  },
  // 8 — Electricity (Jankipuram) — submitted
  {
    id: 'f8a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-403',
    title: 'Upgrading 250kVA transformer to prevent voltage drops in Jankipuram Sector G',
    category: 'Electricity', description: 'Frequent load-shedding and low voltage drops have damaged local household appliances in Jankipuram Sector G. A secondary 400kVA transformer needs to be installed to distribute the load.',
    location_lat: 26.9200, location_lng: 80.9400, village: 'Jankipuram', block: 'Lucknow North',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 4000,
    urgency: 'high', status: 'submitted',
    ai_score_completeness: 87, ai_score_impact: 'High', ai_score_location_verified: true,
    ai_score_photo_verified: false, ai_score_confidence: 89, supporters: 184, estimated_cost_lakhs: 40,
    created_at: daysAgo(5), updated_at: daysAgo(5)
  },
  // 9 — Public Transport (Ashiyana) — submitted
  {
    id: 'f9a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-504',
    title: 'Smart bus shelter construction along Ashiyana main road',
    category: 'Public Transport', description: 'Construction of a clean, weather-protected bus shelter with public seating and dynamic timetable displays near Ashiyana Sector H intersection to encourage public transport use.',
    location_lat: 26.7900, location_lng: 80.9200, village: 'Ashiyana', block: 'Sarojini Nagar',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 7000,
    urgency: 'low', status: 'submitted',
    ai_score_completeness: 75, ai_score_impact: 'Low', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 80, supporters: 98, estimated_cost_lakhs: 12,
    created_at: daysAgo(14), updated_at: daysAgo(2)
  },
  // 10 — Women's Safety (Charbagh) — under_review
  {
    id: 'f0a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', citizen_id: 'citizen-504',
    title: 'CCTV surveillance network installation near Charbagh railway station exit',
    category: "Women's Safety", description: 'To prevent eve-teasing and ensure safety of night-time women commuters, a network of 12 high-definition CCTV security cameras with automatic link to local police booth needs to be installed.',
    location_lat: 26.8300, location_lng: 80.9200, village: 'Charbagh', block: 'Lucknow Central',
    district: 'Lucknow', state: 'Uttar Pradesh', estimated_beneficiaries: 30000,
    urgency: 'critical', status: 'under_review',
    ai_score_completeness: 94, ai_score_impact: 'Critical', ai_score_location_verified: true,
    ai_score_photo_verified: true, ai_score_confidence: 96, supporters: 1048, estimated_cost_lakhs: 15,
    created_at: daysAgo(25), updated_at: daysAgo(3)
  }
] as any;

let proposalSupports: ProposalSupport[] = [];

// Initialize consensus_score, support_count dynamically for initial mock suggestions
suggestions.forEach(s => {
  if (s.support_count === undefined) {
    s.support_count = s.supporters || Math.floor(Math.random() * 400) + 12;
  }
  if (s.consensus_score === undefined) {
    // Dynamically calculate a realistic consensus score using standard variables
    const citizenScore = Math.min(40, Math.round((s.support_count / 1000) * 40));
    const mukhiyaScore = (s.support_count % 2 === 0) ? 25 : 0;
    const mlaScore = (s.support_count > 100) ? 20 : 10;
    const aiScore = Math.round((s.ai_score_completeness || 70) * 0.15);
    s.consensus_score = Math.min(100, citizenScore + mukhiyaScore + mlaScore + aiScore);
  }
  if (s.duplicate_group_id === undefined) {
    s.duplicate_group_id = null;
  }
});

let mediaAttachments: MediaAttachment[] = [
  { id: 'media-1', suggestion_id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1590247813693-5541f1c609fd?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(10) },
  { id: 'media-2', suggestion_id: 'f2a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(20) },
  { id: 'media-3', suggestion_id: 'f4a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(8) },
  { id: 'media-4', suggestion_id: 'f7a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1584463699057-a0c20e5e8d56?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(7) },
  { id: 'media-5', suggestion_id: 'f9a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(14) },
  { id: 'media-6', suggestion_id: 'f0a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', file_type: 'image', created_at: daysAgo(25) },
];

let timelineEvents: TimelineEvent[] = [
  { id: 't-1', suggestion_id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered by citizen.', created_at: daysAgo(10) },
  { id: 't-2', suggestion_id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'ai_processing', notes: 'Gemini AI evaluated infrastructure gap and quality score.', created_at: daysAgo(10) },
  { id: 't-3', suggestion_id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'duplicate_checked', notes: 'Consensus engine verified and found no duplicates.', created_at: daysAgo(9) },
  { id: 't-4', suggestion_id: 'f1a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'under_review', notes: 'Forwarded to Lucknow Constituency Planning team for review.', created_at: daysAgo(5) },
  
  { id: 't-5', suggestion_id: 'f2a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(20) },
  { id: 't-6', suggestion_id: 'f2a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'under_review', notes: 'Forwarded to Lucknow Constituency Planning team for review.', created_at: daysAgo(15) },
  { id: 't-7', suggestion_id: 'f2a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'planned', notes: 'Funds allocated under Lucknow local development scheme.', created_at: daysAgo(10) },
  
  { id: 't-8', suggestion_id: 'f3a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(15) },
  
  { id: 't-9', suggestion_id: 'f4a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(8) },
  { id: 't-10', suggestion_id: 'f4a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'under_review', notes: 'Forwarded to Lucknow Constituency Planning team for review.', created_at: daysAgo(8) },
  
  { id: 't-11', suggestion_id: 'f5a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(22) },
  { id: 't-12', suggestion_id: 'f5a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'planned', notes: 'Funds allocated under Lucknow local development scheme.', created_at: daysAgo(4) },
  
  { id: 't-13', suggestion_id: 'f6a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(12) },
  { id: 't-14', suggestion_id: 'f6a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'completed', notes: 'Contractor completed physical site build. Local inspection approved.', created_at: daysAgo(6) },
  
  { id: 't-15', suggestion_id: 'f7a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(7) },
  { id: 't-16', suggestion_id: 'f7a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'under_review', notes: 'Forwarded to Lucknow Constituency Planning team for review.', created_at: daysAgo(7) },
  
  { id: 't-17', suggestion_id: 'f8a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(5) },
  
  { id: 't-18', suggestion_id: 'f9a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(14) },
  
  { id: 't-19', suggestion_id: 'f0a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'submitted', notes: 'Suggestion successfully registered.', created_at: daysAgo(25) },
  { id: 't-20', suggestion_id: 'f0a8e9b0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', status: 'under_review', notes: 'Forwarded to Lucknow Constituency Planning team for review.', created_at: daysAgo(3) }
];

let userBadges: UserBadge[] = [
  { id: 'badge-1', user_id: 'citizen-123', badge_type: 'verified_citizen', earned_at: daysAgo(28) },
  { id: 'badge-2', user_id: 'citizen-123', badge_type: 'problem_solver', earned_at: daysAgo(1) },
  { id: 'badge-3', user_id: 'citizen-504', badge_type: 'verified_citizen', earned_at: daysAgo(16) },
  { id: 'badge-4', user_id: 'citizen-504', badge_type: 'top_contributor', earned_at: daysAgo(5) },
];

let appNotifications: AppNotification[] = [];

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
        role: profile.role || 'citizen', created_at: now, updated_at: now,
        aadhaar_number: profile.aadhaar_number,
        verification_status: profile.verification_status || 'incomplete'
      };
      profiles.push(newProfile);
      return newProfile;
    }
  },
  getSuggestions: async (filters?: { citizen_id?: string; category?: string; district?: string; village?: string }): Promise<Suggestion[]> => {
    console.log("mockDb getSuggestions filters:", filters);
    let list = [...suggestions];
    if (filters?.citizen_id) list = list.filter(s => s.citizen_id === filters.citizen_id);
    if (filters?.category && filters.category !== "undefined") list = list.filter(s => s.category === filters.category);
    if (filters?.district) {
      list = list.filter(s => s.district?.toLowerCase() === filters.district?.toLowerCase());
    }
    if (filters?.village) {
      list = list.filter(s => s.village?.toLowerCase() === filters.village?.toLowerCase());
    }
    console.log(`mockDb returning ${list.length} suggestions`);
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
  deleteSuggestion: async (id: string) => {
    const initialLength = suggestions.length;
    // We cannot use standard assignment to `suggestions` if it's let, but it is declared as `let suggestions = []` so we can.
    // However, the best way to modify the array without reassigning if it was const is using splice, but since it's `let` we can just filter.
    // Wait, let's look at how suggestions is declared. `let suggestions: Suggestion[] = [...]`.
    // So we can reassign it or use splice. I'll use findIndex and splice to be safe.
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx > -1) {
      suggestions.splice(idx, 1);
      return true;
    }
    return false;
  },
  getPopulations: async () => {
    return [...areaPopulations];
  },
  addOrUpdatePopulation: async (pop: Omit<AreaPopulation, 'id'> & { id?: string }) => {
    const id = pop.id || `pop-${uuidv4()}`;
    const existingIdx = areaPopulations.findIndex(p => p.id === id || (p.area.toLowerCase() === pop.area.toLowerCase() && p.district.toLowerCase() === pop.district.toLowerCase()));
    const newPopRecord: AreaPopulation = {
      id,
      district: pop.district,
      area: pop.area,
      total_population: Number(pop.total_population),
      male_percentage: Number(pop.male_percentage),
      female_percentage: Number(pop.female_percentage),
      age_0_18_percentage: Number(pop.age_0_18_percentage),
      age_18_60_percentage: Number(pop.age_18_60_percentage),
      age_60_plus_percentage: Number(pop.age_60_plus_percentage)
    };
    if (existingIdx > -1) {
      areaPopulations[existingIdx] = newPopRecord;
    } else {
      areaPopulations.push(newPopRecord);
    }
    return newPopRecord;
  },
  deletePopulation: async (id: string) => {
    const idx = areaPopulations.findIndex(p => p.id === id);
    if (idx > -1) {
      areaPopulations.splice(idx, 1);
      return true;
    }
    return false;
  },
  getDepartments: async () => {
    return [...mockDepartments];
  },
  createDepartment: async (dept: Omit<Department, 'created_at'>) => {
    const newDept = {
      ...dept,
      status: dept.status || 'active',
      verification_status: dept.verification_status || 'verified',
      created_at: new Date().toISOString()
    };
    mockDepartments.push(newDept);
    return newDept;
  },
  updateDepartment: async (id: string, updates: Partial<Department>) => {
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx > -1) {
      mockDepartments[idx] = { ...mockDepartments[idx], ...updates };
      return mockDepartments[idx];
    }
    return null;
  },
  deleteDepartment: async (id: string) => {
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx > -1) {
      mockDepartments.splice(idx, 1);
      return true;
    }
    return false;
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
    const newEvent: TimelineEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    timelineEvents.push(newEvent);
    // keep suggestion status in sync
    const suggestion = suggestions.find(s => s.id === event.suggestion_id);
    if (suggestion) {
      suggestion.status = event.status as any;
      suggestion.updated_at = new Date().toISOString();
    }
    return newEvent;
  },
  getNotifications: async (user_id: string) => {
    return appNotifications.filter(n => n.user_id === user_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  addNotification: async (notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${uuidv4()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    appNotifications.push(newNotification);
    return newNotification;
  },
  markNotificationRead: async (id: string) => {
    const notif = appNotifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
    }
    return notif;
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
  },
  getCitizens: async () => {
    return profiles.filter(p => p.role === 'citizen');
  },
  updateVerificationStatus: async (userId: string, status: 'incomplete' | 'pending' | 'verified' | 'rejected') => {
    const profile = profiles.find(p => p.id === userId);
    if (profile) {
      profile.verification_status = status;
      profile.updated_at = new Date().toISOString();
      if (status === 'verified') {
        const existingBadge = userBadges.find(b => b.user_id === userId && b.badge_type === 'verified_citizen');
        if (!existingBadge) {
          userBadges.push({
            id: `badge-${uuidv4()}`,
            user_id: userId,
            badge_type: 'verified_citizen',
            earned_at: new Date().toISOString()
          });
          profile.contribution_score += 50;
        }
      }
      return profile;
    }
    return null;
  },
  addSupport: async (proposalId: string, userId: string) => {
    const existing = proposalSupports.find(s => s.proposal_id === proposalId && s.user_id === userId);
    if (existing) return false;
    
    proposalSupports.push({
      id: `sup-${uuidv4()}`,
      proposal_id: proposalId,
      user_id: userId,
      supported_at: new Date().toISOString()
    });

    const suggestion = suggestions.find(s => s.id === proposalId);
    if (suggestion) {
      suggestion.support_count += 1;
      // Recalculate Consensus Score
      const citizenScore = Math.min(40, Math.round((suggestion.support_count / 1000) * 40));
      const mukhiyaScore = (suggestion.support_count % 2 === 0) ? 25 : 0;
      const mlaScore = (suggestion.support_count > 100) ? 20 : 10;
      const aiScore = Math.round((suggestion.ai_score_completeness || 70) * 0.15);
      suggestion.consensus_score = Math.min(100, citizenScore + mukhiyaScore + mlaScore + aiScore);
      suggestion.updated_at = new Date().toISOString();
    }
    return true;
  },
  hasSupported: async (proposalId: string, userId: string) => {
    return proposalSupports.some(s => s.proposal_id === proposalId && s.user_id === userId);
  },
  getSupportedSuggestions: async (userId: string) => {
    const supportedIds = proposalSupports
      .filter(s => s.user_id === userId)
      .map(s => s.proposal_id);
    return suggestions.filter(s => supportedIds.includes(s.id));
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

export interface AreaPopulation {
  id: string;
  district: string;
  area: string;
  total_population: number;
  male_percentage: number;
  female_percentage: number;
  age_0_18_percentage: number;
  age_18_60_percentage: number;
  age_60_plus_percentage: number;
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

export let mockDepartments: Department[] = [
  { id: 'pwd', name: 'Public Works Department (PWD)', email: 'pwd@jansunwai.gov.in', password: 'password123', officer: 'Rakesh Kumar (Executive Engineer)', category: 'Road', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() },
  { id: 'water', name: 'District Water & Sanitation Board', email: 'water@jansunwai.gov.in', password: 'password123', officer: 'Sanjay Mishra (Superintending Engineer)', category: 'Drainage', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() },
  { id: 'health', name: 'Health Department (CMO Office)', email: 'health@jansunwai.gov.in', password: 'password123', officer: 'Dr. Alok Srivastava (Chief Medical Officer)', category: 'PHC', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() },
  { id: 'education', name: 'Education Department (BSA Office)', email: 'education@jansunwai.gov.in', password: 'password123', officer: 'Sunita Rawat (Basic Shiksha Adhikari)', category: 'School', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() },
  { id: 'electricity', name: 'UP Power Corporation Ltd (UPPCL)', email: 'uppcl@jansunwai.gov.in', password: 'password123', officer: 'V. K. Singh (Executive Engineer - Distribution)', category: 'Street Lights', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() },
  { id: 'municipal', name: 'Lucknow Nagar Nigam', email: 'nagarnigam@jansunwai.gov.in', password: 'password123', officer: 'Indrajeet Singh (Municipal Commissioner)', category: 'Municipal', status: 'active', verification_status: 'verified', created_at: new Date().toISOString() }
];

let auditLogs: AuditLog[] = [
  { id: 'log-1', adminName: 'Admin Operations', action: 'System online. All constituency listeners active.', timestamp: daysAgo(4), ipAddress: '127.0.0.1' },
  { id: 'log-2', adminName: 'Admin Operations', action: 'Configured Gemini 2.5 Flash as active model.', timestamp: daysAgo(3), ipAddress: '192.168.1.10' },
  { id: 'log-3', adminName: 'Admin Operations', action: 'Synchronized Jal Jeevan Mission dataset.', timestamp: daysAgo(2), ipAddress: '192.168.1.10' }
];

export let areaPopulations: AreaPopulation[] = [
  { id: 'pop-1', district: 'Lucknow', area: 'Jankipuram', total_population: 180000, male_percentage: 53, female_percentage: 47, age_0_18_percentage: 24, age_18_60_percentage: 62, age_60_plus_percentage: 14 },
  { id: 'pop-2', district: 'Lucknow', area: 'Gomti Nagar', total_population: 240000, male_percentage: 51, female_percentage: 49, age_0_18_percentage: 20, age_18_60_percentage: 65, age_60_plus_percentage: 15 },
  { id: 'pop-3', district: 'Lucknow', area: 'Chowk', total_population: 150000, male_percentage: 54, female_percentage: 46, age_0_18_percentage: 28, age_18_60_percentage: 58, age_60_plus_percentage: 14 },
  { id: 'pop-4', district: 'Lucknow', area: 'Hazratganj', total_population: 95000, male_percentage: 52, female_percentage: 48, age_0_18_percentage: 18, age_18_60_percentage: 64, age_60_plus_percentage: 18 },
  { id: 'pop-5', district: 'Lucknow', area: 'Alambagh', total_population: 135000, male_percentage: 52, female_percentage: 48, age_0_18_percentage: 26, age_18_60_percentage: 60, age_60_plus_percentage: 14 },
  { id: 'pop-6', district: 'Lucknow', area: 'Ashiyana', total_population: 165000, male_percentage: 53, female_percentage: 47, age_0_18_percentage: 23, age_18_60_percentage: 63, age_60_plus_percentage: 14 },
  { id: 'pop-7', district: 'Lucknow', area: 'Charbagh', total_population: 110000, male_percentage: 55, female_percentage: 45, age_0_18_percentage: 22, age_18_60_percentage: 66, age_60_plus_percentage: 12 },
  { id: 'pop-8', district: 'Lucknow', area: 'Mahanagar', total_population: 125000, male_percentage: 51, female_percentage: 49, age_0_18_percentage: 21, age_18_60_percentage: 62, age_60_plus_percentage: 17 },
  { id: 'pop-9', district: 'Lucknow', area: 'Aminabad', total_population: 145000, male_percentage: 54, female_percentage: 46, age_0_18_percentage: 27, age_18_60_percentage: 59, age_60_plus_percentage: 14 },
  { id: 'pop-10', district: 'Lucknow', area: 'Indira Nagar', total_population: 210000, male_percentage: 52, female_percentage: 48, age_0_18_percentage: 21, age_18_60_percentage: 63, age_60_plus_percentage: 16 },
  { id: 'pop-11', district: 'Lucknow', area: 'Karpi', total_population: 35000, male_percentage: 52, female_percentage: 48, age_0_18_percentage: 30, age_18_60_percentage: 57, age_60_plus_percentage: 13 }
];

