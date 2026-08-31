import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEA_ACTIVITIES = [
  {
    title: "Evening Chai at Chedi's",
    cost: "₹15/person",
    time: "Today • 6:00 PM",
    deadline: "5:45 PM",
    capacity: 6,
    eligibility: ["Freshers", "Everyone"],
    meetupPoint: "Chedi's Tea Stall"
  },
  {
    title: "Chai at Nescafé",
    cost: "₹20/person",
    time: "Today • 7:30 PM",
    deadline: "7:15 PM",
    capacity: 5,
    eligibility: ["Everyone"],
    meetupPoint: "RP Hall Gate"
  },
  {
    title: "Coffee & Catch-up at CCD",
    time: "Tomorrow • 5:00 PM",
    deadline: "4:30 PM",
    capacity: 4,
    cost: "₹120/person",
    meetupPoint: "CCD, Tech Market"
  },
  {
    title: "Late-night Chai & Maggie",
    time: "Today • 11:30 PM",
    deadline: "11:15 PM",
    capacity: 6,
    cost: "₹40/person",
    eligibility: ["Everyone"],
    meetupPoint: "LBS Hall Dhaba"
  }
];

async function seed() {
  console.log("Seeding activities...");
  
  // 1. Get a host (pick the first user)
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  if (userError || !users?.length) {
    console.error("Could not find any users to act as host.", userError);
    return;
  }
  const hostId = users[0].id;
  console.log("Using host_id:", hostId);

  // 2. Map activities to db schema
  const rows = TEA_ACTIVITIES.map(a => {
    // Parse time like "Today • 6:00 PM" or "Tomorrow • 5:00 PM"
    const now = new Date();
    if (a.time.toLowerCase().includes("tomorrow")) {
      now.setDate(now.getDate() + 1);
    }
    const match = a.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 0, mins = 0;
    if (match) {
      hours = parseInt(match[1]);
      mins = parseInt(match[2]);
      if (match[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (match[3].toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    now.setHours(hours, mins, 0, 0);

    let deadlineDate = new Date(now);
    const deadMatch = (a.deadline || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (deadMatch) {
      let dH = parseInt(deadMatch[1]);
      let dM = parseInt(deadMatch[2]);
      if (deadMatch[3].toUpperCase() === "PM" && dH !== 12) dH += 12;
      if (deadMatch[3].toUpperCase() === "AM" && dH === 12) dH = 0;
      deadlineDate.setHours(dH, dM, 0, 0);
    } else {
      deadlineDate.setHours(hours - 1, mins, 0, 0); // fallback 1 hr before
    }

    return {
      host_id: hostId,
      category: "Food & Drinks",
      subcategory: "tea-coffee",
      title: a.title,
      starts_at: now.toISOString(),
      accept_requests_until: deadlineDate.toISOString(),
      meetup_point: a.meetupPoint,
      activity_location: a.meetupPoint,
      max_participants: a.capacity,
      gender: "Any",
      eligibility_tags: a.eligibility || null,
      estimated_cost: a.cost ? parseInt(a.cost.replace(/\D/g, "")) : null,
      chat_enabled: true,
      status: "UPCOMING"
    };
  });

  const { error } = await supabase.from('activities').insert(rows);
  if (error) {
    console.error("Error inserting seed data:", error);
  } else {
    console.log("Successfully inserted", rows.length, "activities!");
  }
}

seed().catch(console.error);
