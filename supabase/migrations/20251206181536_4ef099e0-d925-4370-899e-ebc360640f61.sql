-- Add discord_channel_name column to contact_messages table
ALTER TABLE public.contact_messages ADD COLUMN discord_channel_name text;

-- Add discord_channel_name column to orders table  
ALTER TABLE public.orders ADD COLUMN discord_channel_name text;