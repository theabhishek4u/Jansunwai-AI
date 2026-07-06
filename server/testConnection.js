const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('=============================================');
console.log('Supabase Connection Diagnostics');
console.log('=============================================');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Detected:', supabaseAnonKey ? 'YES (Length: ' + supabaseAnonKey.length + ')' : 'NO');
console.log('---------------------------------------------');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in server/.env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabase() {
  try {
    // 1. Check basic connection / ping (Auth API)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('✖ Auth API connection failed:', authError.message);
    } else {
      console.log('✔ Auth API connection: SUCCESSFUL');
    }

    // 2. Query states table (Database API)
    const { data: dbData, error: dbError } = await supabase
      .from('states')
      .select('count');

    if (dbError) {
      if (dbError.message.includes('relation "public.states" does not exist')) {
        console.log('⚠ Database connection: CONNECTED (API responds, but tables do not exist yet).');
        console.log('👉 ACTION REQUIRED: Please execute the queries inside "server/src/db/schema.sql" in your Supabase project\'s SQL Editor to set up the tables.');
      } else {
        console.error('✖ Database query failed:', dbError.message);
      }
    } else {
      console.log('✔ Database connection & Tables: ACTIVE & OPERATIONAL');
    }
  } catch (err) {
    console.error('✖ Network connection failed completely. Check internet or Supabase URL.', err.message);
  }
  console.log('=============================================');
}

checkSupabase();
