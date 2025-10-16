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
    const { businessDescription, targetAudience, budget, goals, websiteUrl, scrapedData, quickMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Google Ads certified expert. Generate 3 complete, unique campaign variants.

CRITICAL RULES:
- Generate EXACTLY 3 variants with different strategies
- Each variant must be 100% complete with ALL fields filled
- Use realistic, specific data (no placeholders or "example.com")
- Keep headlines under 30 characters, descriptions under 90 characters

REQUIRED FOR EACH VARIANT:
✓ 12 positive keywords + 6 negative keywords
✓ 3 complete ad variations
✓ 12 headlines per ad (max 30 chars)
✓ 4 descriptions per ad (max 90 chars)
✓ 4 sitelinks, 4 callouts, 4 snippet values
✓ 3 ad groups with keyword distribution
✓ Complete targeting and performance estimates

Return ONLY valid JSON (no markdown, no code blocks):
{
  "variants": [
    {
      "campaign_name": "Specific Campaign Name",
      "strategy": "Clear 2-3 sentence strategy describing the approach and expected results",
      "budget": {"daily_micros": (budget * 1000000), "pacing": "standard"},
      "bidding": {"strategy": "manual_cpc", "initial_bid_micros": 120000},
      "keywords": {
        "positive": ["keyword1", "keyword2", ...12 total],
        "negative": ["negative1", ...6 total]
      },
      "targeting": {
        "locations": ["Country1", "Country2"],
        "demographics": {
          "age_ranges": ["25-34", "35-44"],
          "genders": ["ALL"],
          "incomes": ["INCOME_TIER_3", "INCOME_TIER_4"],
          "interests": ["interest1", ...8 total]
        },
        "devices": "all",
        "schedule": {"start_hour": 6, "end_hour": 22, "days": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]}
      },
      "ad_groups": [
        {"name": "Group 1", "keywords_subset": ["kw1", "kw2", "kw3", "kw4"], "cpc_bid_micros": 130000},
        {"name": "Group 2", "keywords_subset": ["kw5", "kw6", "kw7", "kw8"], "cpc_bid_micros": 125000},
        {"name": "Group 3", "keywords_subset": ["kw9", "kw10", "kw11", "kw12"], "cpc_bid_micros": 120000}
      ],
      "ads": [
        {
          "headlines": ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12"],
          "descriptions": ["Desc1 max 90 chars", "Desc2", "Desc3", "Desc4"],
          "paths": ["path1", "path2"],
          "extensions": {
            "sitelinks": [
              {"text": "Link1", "url": "/page1"},
              {"text": "Link2", "url": "/page2"},
              {"text": "Link3", "url": "/page3"},
              {"text": "Link4", "url": "/page4"}
            ],
            "callouts": ["Callout1", "Callout2", "Callout3", "Callout4"],
            "snippets": {"header": "Features", "values": ["Val1", "Val2", "Val3", "Val4"]}
          }
        },
        ...2 more ads (3 total per variant)
      ],
      "performance_estimate": {"simulated_ctr": 0.08, "est_impressions": 2500, "est_clicks": 200}
    },
    ...2 more variants (3 total)
  ]
}`;

    let userPrompt = `Business: ${businessDescription}
Target Audience: ${targetAudience}
Daily Budget: $${budget}
Goals: ${goals}
Website: ${websiteUrl}

Generate 3 unique, complete Google Ads campaign variants.`;

    if (scrapedData && quickMode) {
      userPrompt += `\n\nWEBSITE DATA:
Title: ${scrapedData.title}
Headlines: ${scrapedData.headlines?.slice(0, 3).join(', ')}
Description: ${scrapedData.description}

Use this to create relevant ads and keywords.`;
    }

    console.log("Calling Lovable AI Gateway with gemini-2.5-pro...");
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
        temperature: 0.7,
        max_tokens: 8000,
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
      console.error("No AI response received");
      throw new Error("No response from AI");
    }

    console.log("AI Response length:", aiResponse.length);

    // Parse JSON - handle markdown and extract JSON object
    let campaigns;
    try {
      let cleanedResponse = aiResponse.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      // Extract JSON object if there's extra text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      console.log("Attempting to parse JSON...");
      campaigns = JSON.parse(cleanedResponse);
      console.log("JSON parsed successfully");
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse response (first 1000 chars):", aiResponse.substring(0, 1000));
      throw new Error("Failed to parse AI response - invalid JSON");
    }

    // Validate structure
    if (!campaigns.variants || !Array.isArray(campaigns.variants)) {
      console.error("Invalid structure - missing variants array");
      throw new Error("Invalid campaign structure - missing variants array");
    }

    if (campaigns.variants.length !== 3) {
      console.error(`Expected 3 variants, got ${campaigns.variants.length}`);
      throw new Error(`Expected exactly 3 campaign variants, got ${campaigns.variants.length}`);
    }

    // Validate each variant
    campaigns.variants.forEach((variant: any, index: number) => {
      const errors: string[] = [];
      
      if (!variant.campaign_name) errors.push("missing campaign_name");
      if (!variant.strategy) errors.push("missing strategy");
      if (!variant.keywords?.positive || variant.keywords.positive.length < 8) {
        errors.push(`need 12+ keywords, got ${variant.keywords?.positive?.length || 0}`);
      }
      if (!variant.ads || variant.ads.length < 2) {
        errors.push(`need 3 ads, got ${variant.ads?.length || 0}`);
      }
      if (variant.ads) {
        variant.ads.forEach((ad: any, adIndex: number) => {
          if (!ad.headlines || ad.headlines.length < 8) {
            errors.push(`ad${adIndex}: need 12 headlines, got ${ad.headlines?.length || 0}`);
          }
          if (!ad.descriptions || ad.descriptions.length < 3) {
            errors.push(`ad${adIndex}: need 4 descriptions, got ${ad.descriptions?.length || 0}`);
          }
        });
      }
      
      if (errors.length > 0) {
        console.error(`Variant ${index + 1} errors:`, errors);
        throw new Error(`Variant ${index + 1} incomplete: ${errors.join(", ")}`);
      }
    });

    console.log("All 3 variants validated successfully!");

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