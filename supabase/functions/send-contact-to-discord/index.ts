import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const DISCORD_CATEGORY_ID = '1368669111328051272';
const SUPABASE_URL = "https://ohsxncrxdqbsuxwybrjp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function generateRandomId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Convert numbers to bold unicode digits
function toBoldUnicode(str: string): string {
  const boldDigits: Record<string, string> = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return str.split('').map(char => boldDigits[char] || char).join('');
}

async function getGuildIdFromCategory(categoryId: string): Promise<string | null> {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${categoryId}`,
    {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to get category info');
    return null;
  }

  const category = await response.json();
  return category.guild_id;
}

async function isUserInGuild(guildId: string, discordId: string): Promise<boolean> {
  console.log(`Checking if user ${discordId} is in guild ${guildId}`);
  
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const isInGuild = response.ok;
  console.log(`User ${discordId} is ${isInGuild ? '' : 'NOT '}in the guild`);
  return isInGuild;
}

async function createPrivateDiscordChannel(
  name: string, 
  categoryId: string, 
  guildId: string, 
  discordUserId?: string | null
): Promise<string | null> {
  console.log(`Creating private Discord channel: ${name} in category ${categoryId}`);
  
  const permissionOverwrites = [
    {
      id: guildId,
      type: 0,
      deny: "1024",
    },
  ];

  if (discordUserId) {
    const userInGuild = await isUserInGuild(guildId, discordUserId);
    if (userInGuild) {
      permissionOverwrites.push({
        id: discordUserId,
        type: 1,
        deny: "0",
        allow: "1024",
      } as any);
      console.log(`Added permission for user ${discordUserId} to view channel`);
    }
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        type: 0,
        parent_id: categoryId,
        permission_overwrites: permissionOverwrites,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create Discord channel:', errorText);
    return null;
  }

  const channel = await response.json();
  console.log('Discord private channel created successfully:', channel.id);
  return channel.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, discord_id')
      .eq('id', user.id)
      .single();

    const discordUsername = profile?.username || 'Utilisateur inconnu';
    const discordId = profile?.discord_id || null;

    const { name, email, subject, message, project_type, contact_message_id } = await req.json();

    console.log('Envoi du message de contact sur Discord:', { name, email, subject, contact_message_id });

    const contactId = generateRandomId();
    const channelName = `✉️・${toBoldUnicode(contactId)}`;

    const guildId = await getGuildIdFromCategory(DISCORD_CATEGORY_ID);
    if (!guildId) {
      throw new Error('Impossible de récupérer le serveur Discord');
    }

    const channelId = await createPrivateDiscordChannel(channelName, DISCORD_CATEGORY_ID, guildId, discordId);
    
    if (!channelId) {
      throw new Error('Impossible de créer le salon Discord');
    }

    if (contact_message_id) {
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({ discord_channel_name: channelName })
        .eq('id', contact_message_id);
      
      if (updateError) {
        console.error('Failed to update contact message with channel name:', updateError);
      } else {
        console.log('Updated contact message with discord_channel_name:', channelName);
      }
    }

    // Configuration du type de projet
    const projectTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
      'website': { label: 'Site Internet', icon: '🌐', color: '#3B82F6' },
      'discord-bot': { label: 'Bot Discord', icon: '🤖', color: '#5865F2' },
      'both': { label: 'Site + Bot Discord', icon: '✨', color: '#8B5CF6' },
      'other': { label: 'Autre Projet', icon: '💡', color: '#F59E0B' },
    };

    const projectConfig = projectTypeConfig[project_type] || projectTypeConfig['other'];

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const embed = {
      author: {
        name: '📨 NOUVEAU MESSAGE DE CONTACT',
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      title: `${projectConfig.icon} ${subject}`,
      color: 0x10B981, // Vert émeraude
      description: `> Un nouveau message de contact a été reçu.\n> **Réponse attendue sous 48h.**`,
      fields: [
        {
          name: '╔══════════════════════════════════════╗',
          value: '​',
          inline: false,
        },
        {
          name: '🏷️ Référence',
          value: `\`\`\`#${contactId}\`\`\``,
          inline: true,
        },
        {
          name: `${projectConfig.icon} Type de Projet`,
          value: `\`\`\`${projectConfig.label}\`\`\``,
          inline: true,
        },
        {
          name: '​',
          value: '​',
          inline: true,
        },
        {
          name: '👤 Informations Client',
          value: `>>> **Nom:** ${name}\n**Email:** ${email}\n**Discord:** ${discordUsername}`,
          inline: false,
        },
        {
          name: '📝 Message',
          value: `\`\`\`${message.length > 900 ? message.substring(0, 900) + '...' : message}\`\`\``,
          inline: false,
        },
        {
          name: '🕐 Reçu le',
          value: `**${formattedDate}** à **${formattedTime}**`,
          inline: false,
        },
        {
          name: '╚══════════════════════════════════════╝',
          value: '​',
          inline: false,
        },
      ],
      thumbnail: {
        url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      footer: {
        text: `WifiRic • Système de Contact`,
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      timestamp: new Date().toISOString(),
    };

    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      }
    );

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Erreur Discord API:', errorText);
      throw new Error(`Erreur Discord: ${discordResponse.status}`);
    }

    console.log('Message envoyé sur Discord avec succès dans le salon:', channelId);

    return new Response(
      JSON.stringify({ success: true, contactId, channelId, channelName }),
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
