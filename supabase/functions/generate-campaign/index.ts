import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessDescription, targetAudience, budget, goals, websiteUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Google Ads certified expert. Generate hyper-optimized, ultra-detailed Google Ads campaigns based on user input.

CRITICAL RULES:
- Generate exactly 3 campaign variants with UNIQUE strategies
- Headlines: Max 30 characters each (15 per ad for responsive search)
- Descriptions: Max 90 characters each (4 per ad)
- Keywords: 15 high-intent keywords per campaign (mix broad/phrase/exact)
- All content must be 100% Google policy compliant (truthful, no guarantees, mobile-optimized)
- Provide realistic performance estimates
- Include comprehensive targeting and extensions

Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "variants": [
    {
      "campaign_name": "Engaging Campaign Name",
      "strategy": "Detailed strategy description (2-3 sentences)",
      "budget": {
        "daily_micros": number (user budget * 1000000),
        "pacing": "standard"
      },
      "bidding": {
        "strategy": "manual_cpc",
        "initial_bid_micros": number (50000-200000 based on competitiveness)
      },
      "keywords": {
        "positive": ["keyword1", "keyword2", ...] (15 keywords with mix of match types),
        "negative": ["neg1", "neg2", ...] (8 keywords)
      },
      "targeting": {
        "locations": ["US", "CA", ...],
        "demographics": {
          "age_ranges": ["25-34", "35-44", ...],
          "genders": ["ALL"],
          "incomes": ["INCOME_TIER_3", ...],
          "interests": ["interest1", ...] (10 interests)
        },
        "devices": "all",
        "schedule": {
          "start_hour": number (0-23),
          "end_hour": number (0-23),
          "days": ["MON", "TUE", ...]
        }
      },
      "ad_groups": [
        {
          "name": "Ad Group Name",
          "keywords_subset": ["keyword1", ...] (5 keywords),
          "cpc_bid_micros": number
        }
      ] (3 ad groups),
      "ads": [
        {
          "headlines": ["Headline 1", ...] (15 headlines, 30 chars max each),
          "descriptions": ["Description 1", ...] (4 descriptions, 90 chars max each),
          "paths": ["path1", "path2"],
          "extensions": {
            "sitelinks": [{"text": "Link Text", "url": "https://example.com/page"}] (4 sitelinks),
            "callouts": ["Callout 1", ...] (4 callouts),
            "snippets": {
              "header": "Snippet Header",
              "values": ["Value 1", ...] (5 values)
            }
          }
        }
      ] (8 ad variations),
      "performance_estimate": {
        "simulated_ctr": number (0.05-0.15),
        "est_impressions": number (1000-5000),
        "est_clicks": number (50-500)
      }
    }
  ]
}`;

    const userPrompt = `Business: ${businessDescription}
Target Audience: ${targetAudience}
Daily Budget: $${budget}
Goals: ${goals}
Website: ${websiteUrl}

Generate 3 unique Google Ads campaign variants optimized for this business.`;

    console.log("Calling Lovable AI Gateway...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI Response:", aiResponse);

    // Parse JSON response
    let campaigns;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      campaigns = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", aiResponse);
      throw new Error("Failed to parse AI response");
    }

    // Validate response structure
    if (!campaigns.variants || !Array.isArray(campaigns.variants) || campaigns.variants.length !== 3) {
      throw new Error("Invalid campaign structure from AI");
    }

    return new Response(
      JSON.stringify(campaigns),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in generate-campaign function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred generating campaigns",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
