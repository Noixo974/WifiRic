/*
  # Create user profiles and contact messages tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `discord_id` (text, unique) - Discord user ID
      - `username` (text) - Discord username
      - `avatar_url` (text) - Discord avatar URL
      - `email` (text) - Discord email
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contact_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Sender's name
      - `email` (text) - Sender's email
      - `subject` (text) - Message subject
      - `message` (text) - Message content
      - `project_type` (text) - Type of project
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for profiles table:
      - Users can view their own profile
      - Users can update their own profile
    - Add policies for contact_messages table:
      - Users can view their own messages
      - Users can create messages for themselves
      - Users can delete their own messages

  3. Important Notes
    - Profiles are automatically created via auth triggers
    - Contact messages are associated with authenticated users
    - Data integrity is maintained through foreign keys
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  discord_id text UNIQUE NOT NULL,
  username text NOT NULL,
  avatar_url text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  project_type text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages"
  ON contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
