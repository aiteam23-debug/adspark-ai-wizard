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
    const { accessToken } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    console.log('Fetching accessible Google Ads customers');

    // First, get list of accessible customers
    const customersResponse = await fetch(
      'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || 'test-token',
        },
      }
    );

    if (!customersResponse.ok) {
      const error = await customersResponse.text();
      console.error('Failed to fetch customers:', error);
      throw new Error(`Failed to fetch Google Ads customers: ${error}`);
    }

    const customersData = await customersResponse.json();
    const customerIds = customersData.resourceNames?.map((name: string) => 
      name.replace('customers/', '')
    ) || [];

    if (customerIds.length === 0) {
      return new Response(
        JSON.stringify({ campaigns: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Found customer IDs:', customerIds);

    // Fetch campaign data for the first customer
    const customerId = customerIds[0];
    
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.clicks,
        metrics.impressions,
        metrics.cost_micros,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status = 'ENABLED'
    `;

    const searchResponse = await fetch(
      `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || 'test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('Failed to fetch campaigns:', error);
      throw new Error(`Failed to fetch campaign data: ${error}`);
    }

    const searchData = await searchResponse.json();
    const campaigns = (searchData.results || []).map((result: any) => ({
      name: result.campaign.name,
      clicks: parseInt(result.metrics.clicks) || 0,
      impressions: parseInt(result.metrics.impressions) || 0,
      cost: parseInt(result.metrics.costMicros) || 0,
      avgCpc: parseInt(result.metrics.averageCpc) || 0,
    }));

    return new Response(
      JSON.stringify({ campaigns }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Google Ads data fetch error:', error);
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
