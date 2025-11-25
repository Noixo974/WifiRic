-- Add discord_access_token column to profiles table
ALTER TABLE profiles 
ADD COLUMN discord_access_token text;

-- Update the handle_new_user function to store the Discord access token
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (
    id, 
    discord_id, 
    username, 
    avatar_url, 
    email,
    discord_access_token
  )
  values (
    new.id,
    new.raw_user_meta_data->>'provider_id',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'provider_token'
  );
  return new;
end;
$function$;