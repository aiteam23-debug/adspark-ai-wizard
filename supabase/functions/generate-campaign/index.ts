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

    const budgetMicros = budget ? parseFloat(budget) * 1000000 : 50000000;
    
    const systemPrompt = `You are a Google Ads expert. Generate EXACTLY 3 campaign variants as valid JSON.

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON (no markdown, no \`\`\`json blocks, no extra text)
- Each variant MUST be complete with all required fields
- Keep responses concise to fit within token limits

REQUIRED STRUCTURE (all fields mandatory):
{
  "variants": [
    {
      "campaign_name": "Unique Campaign Name",
      "strategy": "Brief 1-2 sentence strategy",
      "budget": {"daily_micros": ${budgetMicros}, "pacing": "standard"},
      "bidding": {"strategy": "manual_cpc", "initial_bid_micros": 120000},
      "keywords": {
        "positive": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"],
        "negative": ["neg1", "neg2", "neg3", "neg4"]
      },
      "targeting": {
        "locations": ["United States"],
        "demographics": {
          "age_ranges": ["25-34", "35-44"],
          "genders": ["ALL"],
          "incomes": ["INCOME_TIER_3"],
          "interests": ["topic1", "topic2", "topic3", "topic4"]
        },
        "devices": "all",
        "schedule": {"start_hour": 6, "end_hour": 22, "days": ["MON","TUE","WED","THU","FRI"]}
      },
      "ad_groups": [
        {"name": "Group A", "keywords_subset": ["kw1","kw2","kw3"], "cpc_bid_micros": 130000},
        {"name": "Group B", "keywords_subset": ["kw4","kw5","kw6"], "cpc_bid_micros": 120000}
      ],
      "ads": [
        {
          "headlines": ["H1 max 30c", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"],
          "descriptions": ["D1 max 90 chars", "D2", "D3", "D4"],
          "paths": ["path1", "path2"],
          "extensions": {
            "sitelinks": [
              {"text": "Link1", "url": "/p1"},
              {"text": "Link2", "url": "/p2"}
            ],
            "callouts": ["Callout1", "Callout2"],
            "snippets": {"header": "Features", "values": ["V1", "V2"]}
          }
        },
        {
          "headlines": ["Alt H1", "Alt H2", "Alt H3", "Alt H4", "Alt H5", "Alt H6", "Alt H7", "Alt H8", "Alt H9", "Alt H10"],
          "descriptions": ["Alt D1", "Alt D2", "Alt D3", "Alt D4"],
          "paths": ["path1", "path2"],
          "extensions": {
            "sitelinks": [{"text": "Link3", "url": "/p3"}, {"text": "Link4", "url": "/p4"}],
            "callouts": ["Callout3", "Callout4"],
            "snippets": {"header": "Benefits", "values": ["V3", "V4"]}
          }
        }
      ],
      "performance_estimate": {"simulated_ctr": 0.065, "est_impressions": 2000, "est_clicks": 130}
    }
  ]
}

Generate 3 variants with different strategies (broad reach, targeted conversion, brand awareness). Use real, relevant data based on the business context.`;

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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 6000,
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
      if (!variant.keywords?.positive || variant.keywords.positive.length < 5) {
        errors.push(`need 5+ keywords, got ${variant.keywords?.positive?.length || 0}`);
      }
      if (!variant.ads || variant.ads.length < 1) {
        errors.push(`need at least 1 ad, got ${variant.ads?.length || 0}`);
      }
      if (variant.ads) {
        variant.ads.forEach((ad: any, adIndex: number) => {
          if (!ad.headlines || ad.headlines.length < 5) {
            errors.push(`ad${adIndex}: need 5+ headlines, got ${ad.headlines?.length || 0}`);
          }
          if (!ad.descriptions || ad.descriptions.length < 2) {
            errors.push(`ad${adIndex}: need 2+ descriptions, got ${ad.descriptions?.length || 0}`);
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