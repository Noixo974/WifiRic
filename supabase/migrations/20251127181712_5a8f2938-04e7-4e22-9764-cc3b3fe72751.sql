-- Allow public reading of profiles for display purposes (username, avatar)
-- This is needed so that reviews can show author information to all visitors
CREATE POLICY "Profiles are publicly readable" 
ON public.profiles 
FOR SELECT 
USING (true);