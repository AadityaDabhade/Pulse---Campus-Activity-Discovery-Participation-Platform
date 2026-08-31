-- Seed Script to populate the Activities table with the Tea & Coffee Mock Data
DO $$
DECLARE
  v_host_id uuid;
BEGIN
  -- 1. Grab the first user in the auth.users table to act as the host
  SELECT id INTO v_host_id FROM auth.users LIMIT 1;
  
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users. Please sign up an account first!';
  END IF;
  
  -- 2. Insert the mock activities, attached to this user
  INSERT INTO public.activities (
    host_id, category, subcategory, title, starts_at, accept_requests_until,
    meetup_point, activity_location, max_participants, gender, estimated_cost, chat_enabled, status
  )
  VALUES 
  (v_host_id, 'Food & Drinks', 'tea-coffee', 'Evening Chai at Chedi''s', NOW() + interval '12 hours', NOW() + interval '11 hours', 'Chedi''s Tea Stall', 'Chedi''s Tea Stall', 6, 'Any', 15, true, 'UPCOMING'),
  (v_host_id, 'Food & Drinks', 'tea-coffee', 'Chai at Nescafé', NOW() + interval '14 hours', NOW() + interval '13 hours', 'RP Hall Gate', 'RP Hall Gate', 5, 'Any', 20, true, 'UPCOMING'),
  (v_host_id, 'Food & Drinks', 'tea-coffee', 'Coffee & Catch-up at CCD', NOW() + interval '2 days', NOW() + interval '1 day 23 hours', 'CCD, Tech Market', 'CCD, Tech Market', 4, 'Any', 120, true, 'UPCOMING'),
  (v_host_id, 'Food & Drinks', 'tea-coffee', 'Late-night Chai & Maggie', NOW() + interval '18 hours', NOW() + interval '17 hours', 'LBS Hall Dhaba', 'LBS Hall Dhaba', 6, 'Any', 40, true, 'UPCOMING');

  RAISE NOTICE 'Activities successfully seeded!';
END $$;
