-- Ajouter la colonne auto_join_discord à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN auto_join_discord boolean NOT NULL DEFAULT true;

-- Commenter la colonne pour la documentation
COMMENT ON COLUMN public.profiles.auto_join_discord IS 
'Détermine si l''utilisateur souhaite rejoindre automatiquement le serveur Discord lors de la connexion ou de l''envoi d''un message';