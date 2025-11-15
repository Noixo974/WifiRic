import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const DISCORD_CHANNEL_ID = '1439273217591087167';
const SUPABASE_URL = "https://ohsxncrxdqbsuxwybrjp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non authentifié');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Utilisateur non valide');
    }

    const { name, email, subject, message, project_type } = await req.json();

    console.log('Envoi du message de contact sur Discord:', { name, email, subject });

    // Créer l'embed Discord
    const embed = {
      title: '📬 Nouveau Message de Contact',
      color: 0x5865F2,
      fields: [
        {
          name: '👤 Nom',
          value: name,
          inline: true
        },
        {
          name: '📧 Email',
          value: email,
          inline: true
        },
        {
          name: '📁 Type de Projet',
          value: project_type === 'website' ? '🌐 Site Internet' 
                : project_type === 'discord-bot' ? '🤖 Bot Discord'
                : project_type === 'both' ? '✨ Les deux'
                : '💡 Autre',
          inline: true
        },
        {
          name: '📝 Sujet',
          value: subject,
          inline: false
        },
        {
          name: '💬 Message',
          value: message.length > 1024 ? message.substring(0, 1021) + '...' : message,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `ID Utilisateur: ${user.id}`
      }
    };

    // Envoyer sur Discord
    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed]
        }),
      }
    );

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Erreur Discord API:', errorText);
      throw new Error(`Erreur Discord: ${discordResponse.status}`);
    }

    console.log('Message envoyé sur Discord avec succès');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erreur dans send-contact-to-discord:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
