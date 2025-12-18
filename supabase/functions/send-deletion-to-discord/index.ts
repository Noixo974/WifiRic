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

async function findChannelByName(guildId: string, channelName: string): Promise<string | null> {
  console.log(`Looking for channel: ${channelName} in guild: ${guildId}`);
  
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to get guild channels');
    return null;
  }

  const channels = await response.json();
  const channel = channels.find((c: any) => c.name === channelName && c.parent_id === DISCORD_CATEGORY_ID);
  
  if (channel) {
    console.log(`Found channel: ${channel.id}`);
    return channel.id;
  }
  
  console.log('Channel not found');
  return null;
}

async function sendMessageToChannel(channelId: string, embed: any): Promise<boolean> {
  const response = await fetch(
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send message to channel:', errorText);
    return false;
  }

  console.log('Message sent successfully to channel:', channelId);
  return true;
}

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

    // Get user profile and check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!roleData;
    const username = profile?.username || 'Utilisateur inconnu';

    const { type, item_id, channel_name } = await req.json();

    console.log('Processing deletion notification:', { type, item_id, channel_name, username, isAdmin });

    if (!type || !item_id) {
      throw new Error('Paramètres manquants: type et item_id requis');
    }

    // Get guild ID from category
    const guildId = await getGuildIdFromCategory(DISCORD_CATEGORY_ID);
    if (!guildId) {
      throw new Error('Impossible de récupérer le serveur Discord');
    }

    // Find the channel
    let channelId: string | null = null;
    if (channel_name) {
      channelId = await findChannelByName(guildId, channel_name);
    }

    // If no specific channel found, we'll just log it (channel may have been deleted already)
    if (!channelId) {
      console.log('Channel not found, deletion notification will not be sent to Discord');
      return new Response(
        JSON.stringify({ success: true, message: 'Channel not found, skipping Discord notification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configuration du type
    const typeConfig = {
      order: {
        label: 'Commande',
        icon: '📦',
        color: 0xDC2626, // Rouge profond
        accentColor: '#DC2626',
      },
      contact: {
        label: 'Message de Contact',
        icon: '📬',
        color: 0xF97316, // Orange
        accentColor: '#F97316',
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: 'Élément',
      icon: '📄',
      color: 0xEF4444,
      accentColor: '#EF4444',
    };

    const roleConfig = isAdmin 
      ? { label: 'Administrateur', icon: '👑', color: '#FBBF24' }
      : { label: 'Utilisateur', icon: '👤', color: '#60A5FA' };

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
        name: '⚠️ NOTIFICATION DE SUPPRESSION',
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      title: `${config.icon} ${config.label} Supprimé(e)`,
      color: config.color,
      description: `> Un élément a été supprimé de la base de données.\n> Cette action est **irréversible**.`,
      fields: [
        {
          name: '╔══════════════════════════╗',
          value: '​',
          inline: false,
        },
        {
          name: '🔖 Référence',
          value: `\`\`\`#${item_id.substring(0, 8).toUpperCase()}\`\`\``,
          inline: true,
        },
        {
          name: '📂 Type',
          value: `\`\`\`${config.label}\`\`\``,
          inline: true,
        },
        {
          name: '​',
          value: '​',
          inline: true,
        },
        {
          name: `${roleConfig.icon} Exécuté par`,
          value: `**${username}**\n\`${roleConfig.label}\``,
          inline: true,
        },
        {
          name: '🕐 Date & Heure',
          value: `**${formattedDate}**\n\`${formattedTime}\``,
          inline: true,
        },
        {
          name: '​',
          value: '​',
          inline: true,
        },
        {
          name: '╚══════════════════════════╝',
          value: '​',
          inline: false,
        },
      ],
      thumbnail: {
        url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      footer: {
        text: `WifiRic • Système de Gestion`,
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      timestamp: new Date().toISOString(),
    };

    const sent = await sendMessageToChannel(channelId, embed);

    if (!sent) {
      console.log('Failed to send deletion notification to Discord');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-deletion-to-discord:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
