import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    const GOOGLE_CLIENT_ID = '240860261239-sc0m2bgb4fauh28l5bg55kqqbf177o7o.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const GOOGLE_REDIRECT_URI = 'https://preview--adspark-ai-wizard.lovable.app/auth/callback';

    if (!GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_SECRET is not configured');
    }

    console.log('Exchanging authorization code for access token');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error(`Failed to exchange code: ${error}`);
    }

    const tokenData = await tokenResponse.json();

    return new Response(
      JSON.stringify(tokenData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('OAuth exchange error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
