import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const GUILD_ID = '1368595340894146631';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '').trim();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated using the JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(jwt);

    if (authError || !user) {
      console.error('Authentication error (getUser with jwt):', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user in add-user-to-discord-server:', user.id);

    // Get user's Discord ID and access token from their profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('discord_id, discord_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.discord_id) {
      console.error('Profile error or no Discord ID:', profileError);
      return new Response(
        JSON.stringify({ error: 'Discord ID not found for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.discord_access_token) {
      console.error('No Discord access token found for user profile:', user.id);
      return new Response(
        JSON.stringify({ error: 'Discord access token not found. Please reconnect your Discord account.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const discordUserId = profile.discord_id;

    console.log(`Attempting to add user ${discordUserId} to guild ${GUILD_ID}`);

    // Try to add the user to the Discord server using their OAuth2 access token
    const addMemberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: profile.discord_access_token
        }),
      }
    );

    if (!addMemberResponse.ok) {
      const errorData = await addMemberResponse.text();
      console.error('Discord API error:', addMemberResponse.status, errorData);
      
      // If the user is already in the server, that's fine
      if (addMemberResponse.status === 204 || errorData.includes('already')) {
        return new Response(
          JSON.stringify({ success: true, message: 'User already in server' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to add user to Discord server',
          details: errorData 
        }),
        { status: addMemberResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully processed Discord server join request');

    return new Response(
      JSON.stringify({ success: true, message: 'User added to Discord server' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-user-to-discord-server function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
