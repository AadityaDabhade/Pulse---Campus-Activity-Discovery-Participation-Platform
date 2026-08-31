import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateJoin() {
  console.log("Simulating a new user joining your activity...");

  // 1. Create a dummy test user
  const email = `testuser_${Date.now()}@pulse.app`;
  const password = "securepassword123";
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: "Test Student",
        hall: "RP Hall"
      }
    }
  });

  if (authError || !authData.user) {
    console.error("Failed to create test user:", authError);
    return;
  }
  
  const testUserId = authData.user.id;
  console.log(`✅ Created test user: ${email}`);

  // Wait a moment for the database trigger to create the public profile
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update the test user's name in the public profile
  await supabase.from('users').update({ name: "Test Student", hall: "RP Hall" }).eq('id', testUserId);

  // 2. Find the first upcoming activity
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title')
    .eq('status', 'UPCOMING')
    .limit(1);

  if (actError || !activities || activities.length === 0) {
    console.error("Could not find any upcoming activities to join.");
    return;
  }

  const activity = activities[0];
  console.log(`✅ Found activity: "${activity.title}"`);

  // 3. Send a join request
  const { error: reqError } = await supabase
    .from('activity_requests')
    .insert({
      activity_id: activity.id,
      user_id: testUserId,
      status: 'REQUESTED'
    });

  if (reqError) {
    console.error("Failed to send join request:", reqError);
  } else {
    console.log(`🎉 Success! "Test Student" has sent a request to join "${activity.title}".`);
    console.log(`\n👉 Next step: Go to the app as the host, open "Activity Hub -> Hosted -> Manage Activity" for this activity and try approving them!`);
  }
}

simulateJoin().catch(console.error);
