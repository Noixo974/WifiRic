-- Créer la table contact_messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  project_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent créer leurs propres messages
CREATE POLICY "Users can create own messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent voir leurs propres messages
CREATE POLICY "Users can view own messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);