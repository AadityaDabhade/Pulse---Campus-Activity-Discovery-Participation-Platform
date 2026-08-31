-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view their own requests and host can view all requests" ON public.activity_requests;

-- Create a non-recursive policy
CREATE POLICY "Users can view their own requests and host can view all requests"
  ON public.activity_requests FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.activities 
      WHERE id = activity_requests.activity_id 
      AND host_id = auth.uid()
    )
    OR
    (status = 'APPROVED' AND EXISTS (
      -- Instead of querying activity_requests, we could just allow anyone to view approved requests for an activity they are viewing
      -- Wait, if they are viewing the activity, it's public anyway! Let's just say anyone can see approved participants.
      SELECT 1 FROM public.activities WHERE id = activity_requests.activity_id
    ))
  );
