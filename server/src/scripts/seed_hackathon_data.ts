import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { id: 1, name: 'Roads & Infrastructure', limit: 15 },
  { id: 2, name: 'Water Supply', limit: 12 },
  { id: 3, name: 'Healthcare & Public Health', limit: 10 },
  { id: 4, name: 'Education Infrastructure', limit: 14 },
  { id: 5, name: 'Electricity & Street Lights', limit: 18 },
  { id: 6, name: 'Sanitation & Waste Management', limit: 11 },
];

const areas = [
  'Gomti Nagar', 'Indira Nagar', 'Aliganj', 'Hazratganj', 'Chowk', 'Aminabad', 'Aashiana', 'Vikas Nagar', 'Mahanagar'
];

const complaintsPool = {
  'Roads & Infrastructure': [
    { t: 'Road entirely broken near intersection', d: 'Sadak par bahut gahre gaddhe hain, pichle 2 mahine se kisi ne repair nahi kiya hai. Accident ka khatra hai.' },
    { t: 'Street paving stopped halfway', d: 'The contractor started the paving work but abandoned it halfway. Now there is dust everywhere.' },
    { t: 'Potholes causing daily traffic jam', d: 'Bhaiya, subah shaam yahan itna jam lagta hai sirf in gaddho ki wajah se. Please fix this.' },
    { t: 'Dangerous open manhole on main road', d: 'Ek open manhole hai jo raat mein dikhta nahi hai. It is extremely dangerous for bikers.' },
    { t: 'Galli road washed away in rain', d: 'Baarish mein poori gali ki sadak beh gayi hai. Kichad hi kichad hai.' }
  ],
  'Water Supply': [
    { t: 'No drinking water for 3 days', d: 'Pichle 3 din se paani nahi aa raha hai. Jal Nigam me complaint ki par koi sunwai nahi.' },
    { t: 'Dirty, muddy water in taps', d: 'The water supply is completely muddy and smells bad. Bachche bimaar pad rahe hain.' },
    { t: 'Pipeline burst near colony gate', d: 'Main pipeline leak ho gayi hai, subah se hazaro liter paani beh chuka hai.' },
    { t: 'Low water pressure in summer', d: 'Garmiyon mein paani ka pressure itna kam hai ki first floor tak bhi paani nahi pahuchta.' },
    { t: 'Water tank not cleaned for years', d: 'Colony ka water tank pichle 2 saal se saaf nahi hua hai. Water is contaminated.' }
  ],
  'Healthcare & Public Health': [
    { t: 'No doctors available in local PHC', d: 'Primary Health Center me pichle ek hafte se koi doctor nahi aaya hai. Patients are suffering.' },
    { t: 'Expired medicines given at clinic', d: 'Sarkari dispensary me expired dawaiyan di ja rahi hain. This is playing with public health.' },
    { t: 'Dengue breeding ground due to waterlogging', d: 'Khaali plot me paani bhara hua hai, machhar paida ho rahe hain. Dengue ka khatra hai.' },
    { t: 'Hospital X-ray machine broken', d: 'District hospital ki X-ray machine 2 mahine se kharab padi hai.' },
    { t: 'No ambulance available at night', d: 'Raat mein emergency ke time pe ambulance call karne pe nahi aati.' }
  ],
  'Education Infrastructure': [
    { t: 'School building construction halted', d: 'Government school ki nayi building ka kaam 6 mahine se ruka hua hai aur contractors gaayab hain. Bachhon ko majboori mein bahar khule aasmaan ke niche padhna pad raha hai.' },
    { t: 'No toilets in primary school', d: 'The local primary school does not have functioning toilets. It is very difficult for girl students.' },
    { t: 'Rainwater leaking from school roof', d: 'School ki chhat se paani tapakta hai baarish mein. Classes cancel karni padti hain.' },
    { t: 'Mid-day meal quality is very poor', d: 'Bachho ko mid-day meal mein jo khana mil raha hai uski quality bahut kharab hai.' },
    { t: 'Desks and chairs broken', d: 'Classrooms don\'t have proper desks. Children sit on the floor in winters.' }
  ],
  'Electricity & Street Lights': [
    { t: 'Streetlights not working for weeks', d: 'Colony ki streetlights pichle do hafte se kharab hain. Raat ko bahut andhera rehta hai, chori ka darr hai.' },
    { t: 'Frequent power cuts daily', d: 'Din bhar mein 5-6 baar light jaati hai. Inverters bhi discharge ho jate hain.' },
    { t: 'Transformer sparks dangerously', d: 'The transformer sparks and catches fire sometimes. It needs immediate replacement.' },
    { t: 'High voltage damages appliances', d: 'Kal high voltage aane ki wajah se kai logo ke TV aur fridge jal gaye.' },
    { t: 'Hanging live wires on street', d: 'Nange taar latak rahe hain street par. Kisi din bada haadsa ho sakta hai.' }
  ],
  'Sanitation & Waste Management': [
    { t: 'Garbage not collected for a week', d: 'Kachra gadi 7 din se nahi aayi hai. Poore mohalle mein kachre ka dher lag gaya hai aur badboo aa rahi hai.' },
    { t: 'Drains overflowing on road', d: 'Naali ka paani sadak par aa raha hai. Pedestrians ka chalna mushkil ho gaya hai.' },
    { t: 'Public toilet is extremely dirty', d: 'The public toilet near the market is completely unmaintained and unusable.' },
    { t: 'Open dumping ground creating health hazard', d: 'Khaali maidan ko dumping ground bana diya gaya hai. Ispe action lijiye.' },
    { t: 'Sweepers demand money', d: 'Nagar nigam ke safai karamchari saaf safai ke liye paise maangte hain.' }
  ]
};

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runSeed() {
  console.log("Starting data seed...");
  let count = 0;

  // Fetch a valid citizen ID
  const { data: users, error: userError } = await supabase.from('citizen_profiles').select('id').limit(1);
  let citizenId = 'd7b00000-0000-0000-0000-000000000001';
  
  if (!userError && users && users.length > 0) {
    citizenId = users[0].id;
    console.log(`Using citizen ID: ${citizenId}`);
  } else {
    // Try to get from auth users if citizen_profiles is empty
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    if (!authError && authUser && authUser.users.length > 0) {
       citizenId = authUser.users[0].id;
       console.log(`Using Auth User ID: ${citizenId}`);
    } else {
       console.log("Could not find a valid user in database. Using fallback UUID which may fail FK constraints.");
    }
  }

  for (const cat of categories) {
    // Ensure category exists
    const { data: catData } = await supabase.from('suggestion_categories')
      .upsert({ id: cat.id, name: cat.name })
      .select().single();
      
    const pool = complaintsPool[cat.name as keyof typeof complaintsPool];
    if (!pool) continue;

    for (let i = 0; i < cat.limit; i++) {
      const template = randomElement(pool);
      const area = randomElement(areas);
      const urgencyScore = randomInt(50, 100);
      let urgency = 'medium';
      if (urgencyScore > 90) urgency = 'critical';
      else if (urgencyScore > 75) urgency = 'high';
      else if (urgencyScore < 60) urgency = 'low';

      const statusOptions = ['submitted', 'ai_processing', 'under_review', 'infra_analyzed', 'planned'];
      const status = statusOptions[randomInt(0, statusOptions.length - 1)];

      const suggestion = {
        citizen_id: citizenId,
        title: `${template.t} in ${area}`,
        category: cat.name,
        category_id: cat.id,
        description: template.d,
        location_lat: 26.8467 + (Math.random() - 0.5) * 0.1, // Approx Lucknow lat
        location_lng: 80.9462 + (Math.random() - 0.5) * 0.1, // Approx Lucknow lng
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        village: area,
        estimated_beneficiaries: randomInt(100, 5000),
        urgency,
        status
      };

      const { data, error } = await supabase.from('suggestions').insert(suggestion).select().single();
      if (error) {
        console.error(`Error inserting suggestion: ${error.message}`);
        continue;
      }
      count++;
      
      // Also insert AI Priority Score if we have it
      if (data) {
        await supabase.from('ai_priority_scores').insert({
           suggestion_id: data.id,
           priority_score: randomInt(60, 98),
           infrastructure_gap_score: randomInt(50, 95),
           community_demand_score: randomInt(40, 99),
           urgency_score: urgencyScore
        });
      }
    }
  }

  console.log(`Successfully seeded ${count} complaints!`);
}

runSeed().catch(console.error);
