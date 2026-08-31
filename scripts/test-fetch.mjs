import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  // Login as the actual host user (Wait, I don't know the user's password)
  // Instead, let's just query with anon key to see if RLS blocks it.
  
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, title')
    .eq('status', 'UPCOMING')
    .limit(1);

  if (activities && activities.length > 0) {
    const activityId = activities[0].id;
    console.log("Found activity", activityId);
    
    // Now try fetching requests as anon
    const { data: reqs, error: reqErr } = await supabase
      .from('activity_requests')
      .select('id, status, user_id, users(name)')
      .eq('activity_id', activityId);
      
    console.log("Requests (Anon):", reqs, reqErr);
  }
}
testFetch();
