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

    const orderData = await req.json();
    console.log('Received order data:', JSON.stringify(orderData, null, 2));

    const {
      order_id,
      site_type,
      site_type_other,
      site_name,
      logo_urls,
      primary_color,
      secondary_color,
      other_colors,
      specific_instructions,
      description,
      budget,
      budget_text,
      full_name,
      email,
    } = orderData;

    const guildId = await getGuildIdFromCategory(DISCORD_CATEGORY_ID);
    if (!guildId) {
      throw new Error('Impossible de récupérer le serveur Discord');
    }

    const channelName = `📦・${toBoldUnicode(order_id)}`;
    const channelId = await createPrivateDiscordChannel(channelName, DISCORD_CATEGORY_ID, guildId, discordId);
    
    if (!channelId) {
      throw new Error('Impossible de créer le salon Discord');
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ discord_channel_name: channelName })
      .eq('order_id', order_id);
    
    if (updateError) {
      console.error('Failed to update order with channel name:', updateError);
    } else {
      console.log('Updated order with discord_channel_name:', channelName);
    }

    // Configuration des types de site
    const siteTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
      'vitrine': { label: 'Site Vitrine', icon: '🏪', color: '#3B82F6' },
      'ecommerce': { label: 'E-commerce', icon: '🛒', color: '#10B981' },
      'dashboard': { label: 'Dashboard', icon: '📊', color: '#8B5CF6' },
      'portfolio': { label: 'Portfolio', icon: '🎨', color: '#EC4899' },
      'landing': { label: 'Landing Page', icon: '🚀', color: '#F59E0B' },
      'community': { label: 'Site Communautaire', icon: '👥', color: '#06B6D4' },
      'webapp': { label: 'Application Web', icon: '💻', color: '#6366F1' },
      'other': { label: 'Autre', icon: '✨', color: '#A855F7' },
    };

    const siteConfig = site_type === 'other' && site_type_other 
      ? { label: site_type_other, icon: '✨', color: '#A855F7' }
      : siteTypeConfig[site_type] || siteTypeConfig['other'];

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

    // Construction des couleurs
    let colorsDisplay = '';
    if (primary_color) colorsDisplay += `🔵 Primaire: \`${primary_color}\`\n`;
    if (secondary_color) colorsDisplay += `🟣 Secondaire: \`${secondary_color}\`\n`;
    if (other_colors && other_colors.length > 0) {
      colorsDisplay += `🎨 Autres: ${other_colors.map((c: string) => `\`${c}\``).join(' ')}`;
    }

    // Construction du budget
    let budgetDisplay = 'Non spécifié';
    if (budget) {
      budgetDisplay = `**${budget}€**`;
      if (budget_text) budgetDisplay += `\n_${budget_text}_`;
    } else if (budget_text) {
      budgetDisplay = budget_text;
    }

    // Construction des logos
    let logosDisplay = 'Aucun fichier';
    if (logo_urls && logo_urls.length > 0 && logo_urls.some((url: string) => url)) {
      const validUrls = logo_urls.filter((url: string) => url);
      logosDisplay = validUrls.map((url: string, index: number) => `[📎 Fichier ${index + 1}](${url})`).join('\n');
    }

    const fields = [
      {
        name: '╔═════════════════════════╗',
        value: '​',
        inline: false,
      },
      {
        name: '🏷️ Référence Commande',
        value: `\`\`\`#${order_id}\`\`\``,
        inline: true,
      },
      {
        name: `${siteConfig.icon} Type de Site`,
        value: `\`\`\`${siteConfig.label}\`\`\``,
        inline: true,
      },
      {
        name: '🌐 Nom du Site',
        value: `\`\`\`${site_name || 'Non spécifié'}\`\`\``,
        inline: true,
      },
      {
        name: '👤 Informations Client',
        value: `>>> **Nom:** ${full_name}\n**Email:** ${email}\n**Discord:** ${discordUsername}`,
        inline: false,
      },
    ];

    // Ajouter les couleurs si définies
    if (colorsDisplay) {
      fields.push({
        name: '🎨 Palette de Couleurs',
        value: colorsDisplay,
        inline: true,
      });
    }

    // Ajouter le budget
    fields.push({
      name: '💰 Budget',
      value: budgetDisplay,
      inline: true,
    });

    // Ajouter les logos/fichiers
    fields.push({
      name: '🖼️ Fichiers Joints',
      value: logosDisplay,
      inline: true,
    });

    // Ajouter les instructions spécifiques
    if (specific_instructions) {
      fields.push({
        name: '📌 Instructions Spécifiques',
        value: `\`\`\`${specific_instructions.length > 500 ? specific_instructions.substring(0, 500) + '...' : specific_instructions}\`\`\``,
        inline: false,
      });
    }

    // Ajouter la description
    if (description) {
      fields.push({
        name: '📖 Description du Projet',
        value: `\`\`\`${description.length > 500 ? description.substring(0, 500) + '...' : description}\`\`\``,
        inline: false,
      });
    }

    // Ajouter la date
    fields.push({
      name: '🕐 Reçue le',
      value: `**${formattedDate}** à **${formattedTime}**`,
      inline: false,
    });

    // Fermeture du cadre
    fields.push({
      name: '╚═════════════════════════╝',
      value: '​',
      inline: false,
    });

    const embed = {
      author: {
        name: '🆕 NOUVELLE COMMANDE REÇUE',
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      title: `${siteConfig.icon} ${site_name || 'Nouveau Projet Web'}`,
      color: 0x3B82F6, // Bleu professionnel
      description: `> Une nouvelle commande de site web a été soumise.\n> **Analyse et devis à préparer.**`,
      fields,
      thumbnail: {
        url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      footer: {
        text: `WifiRic • Système de Commandes`,
        icon_url: 'https://i.ibb.co/4nXx45XS/Logo.png',
      },
      timestamp: new Date().toISOString(),
    };

    console.log('Sending to Discord channel:', channelId);

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
      console.error('Discord API error:', errorText);
      throw new Error(`Discord API failed: ${discordResponse.status}`);
    }

    console.log('Discord notification sent successfully to channel:', channelId);

    return new Response(
      JSON.stringify({ success: true, channelId, channelName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-order-to-discord:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
