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

    const systemPrompt = `You are a Google Ads certified expert. Generate hyper-optimized, ultra-detailed Google Ads campaigns based on user input.

CRITICAL RULES - MUST FOLLOW EXACTLY:
- Generate EXACTLY 3 COMPLETE campaign variants with UNIQUE strategies
- EVERY field must be filled with realistic, actionable data
- NO placeholders, NO "example.com", NO generic content
- Each variant must be distinctly different in approach (e.g., aggressive growth, brand awareness, conversion-focused)

MANDATORY SPECIFICATIONS:
Headlines: EXACTLY 15 headlines per ad (max 30 characters each)
Descriptions: EXACTLY 4 descriptions per ad (max 90 characters each)
Keywords: EXACTLY 15 positive keywords + 8 negative keywords per campaign
Ad Variations: EXACTLY 8 complete ad variations per campaign
Ad Groups: EXACTLY 3 ad groups per campaign
Sitelinks: EXACTLY 4 sitelinks with real page suggestions
Callouts: EXACTLY 4 compelling callouts
Snippet Values: EXACTLY 5 values for structured snippets

Return ONLY valid JSON in this EXACT format with ALL fields filled:
{
  "variants": [
    {
      "campaign_name": "Compelling Campaign Name (unique for each variant)",
      "strategy": "Detailed 2-3 sentence strategy explaining the approach and expected outcomes",
      "budget": {
        "daily_micros": (user_budget * 1000000),
        "pacing": "standard"
      },
      "bidding": {
        "strategy": "manual_cpc",
        "initial_bid_micros": (realistic number between 50000-200000)
      },
      "keywords": {
        "positive": ["keyword1", "keyword2", ...15 total keywords with variety],
        "negative": ["negative1", "negative2", ...8 total negative keywords]
      },
      "targeting": {
        "locations": ["United States", "Canada", "United Kingdom"],
        "demographics": {
          "age_ranges": ["25-34", "35-44", "45-54"],
          "genders": ["ALL"],
          "incomes": ["INCOME_TIER_3", "INCOME_TIER_4"],
          "interests": ["interest1", "interest2", ...10 total relevant interests]
        },
        "devices": "all",
        "schedule": {
          "start_hour": 6,
          "end_hour": 22,
          "days": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        }
      },
      "ad_groups": [
        {
          "name": "Specific Ad Group Name 1",
          "keywords_subset": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
          "cpc_bid_micros": (realistic bid amount in micros)
        },
        {
          "name": "Specific Ad Group Name 2",
          "keywords_subset": ["keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
          "cpc_bid_micros": (realistic bid amount in micros)
        },
        {
          "name": "Specific Ad Group Name 3",
          "keywords_subset": ["keyword11", "keyword12", "keyword13", "keyword14", "keyword15"],
          "cpc_bid_micros": (realistic bid amount in micros)
        }
      ],
      "ads": [
        {
          "headlines": ["Headline 1", "Headline 2", ...15 total headlines, each ≤30 chars],
          "descriptions": ["Description 1", "Description 2", "Description 3", "Description 4"],
          "paths": ["products", "deals"],
          "extensions": {
            "sitelinks": [
              {"text": "Product Category", "url": "/products"},
              {"text": "Special Offers", "url": "/deals"},
              {"text": "About Us", "url": "/about"},
              {"text": "Contact", "url": "/contact"}
            ],
            "callouts": ["Free Shipping", "24/7 Support", "Money Back Guarantee", "Trusted Since 2020"],
            "snippets": {
              "header": "Product Types",
              "values": ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"]
            }
          }
        },
        ...7 more complete ad variations (8 total)
      ],
      "performance_estimate": {
        "simulated_ctr": (number between 0.05-0.15),
        "est_impressions": (number between 1000-5000),
        "est_clicks": (number between 50-500)
      }
    },
    ...2 more complete variants (3 total)
  ]
}

VALIDATION CHECKLIST - Ensure each variant has:
✓ Unique campaign_name and strategy
✓ 15 positive + 8 negative keywords
✓ 3 ad groups with 5 keywords each
✓ 8 complete ad variations
✓ 15 headlines per ad (max 30 chars)
✓ 4 descriptions per ad (max 90 chars)
✓ 4 sitelinks, 4 callouts, 5 snippet values
✓ Performance estimates
✓ Complete targeting with locations, demographics, schedule`;

    let userPrompt = `Business: ${businessDescription}
Target Audience: ${targetAudience}
Daily Budget: $${budget}
Goals: ${goals}
Website: ${websiteUrl}

Generate 3 unique Google Ads campaign variants optimized for this business.`;

    // If scraped data is provided, enhance the prompt
    if (scrapedData && quickMode) {
      userPrompt += `\n\nSCRAPED WEBSITE DATA (use this to curate perfect campaigns):
Title: ${scrapedData.title}
Headlines: ${scrapedData.headlines.join(', ')}
Description: ${scrapedData.description}
Key Points: ${scrapedData.paragraphs.slice(0, 3).join(' ')}
Stats: ${scrapedData.stats.join(', ')}
Services/Features: ${scrapedData.listItems.slice(0, 5).join(', ')}

Use this scraped data to:
- Extract high-intent keywords from headlines and services
- Craft compelling ad copy using actual site language
- Incorporate stats and testimonials into descriptions and callouts
- Target the exact audience this business serves`;
    }

    console.log("Calling Lovable AI Gateway...");
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
    if (!campaigns.variants || !Array.isArray(campaigns.variants)) {
      throw new Error("Invalid campaign structure from AI - missing variants array");
    }

    if (campaigns.variants.length !== 3) {
      console.error(`Expected 3 variants, got ${campaigns.variants.length}`);
      throw new Error(`AI must generate exactly 3 campaign variants, got ${campaigns.variants.length}`);
    }

    // Validate each variant has required fields
    campaigns.variants.forEach((variant: any, index: number) => {
      const errors: string[] = [];
      
      if (!variant.campaign_name) errors.push("missing campaign_name");
      if (!variant.strategy) errors.push("missing strategy");
      if (!variant.keywords?.positive || variant.keywords.positive.length < 10) {
        errors.push(`insufficient positive keywords (${variant.keywords?.positive?.length || 0})`);
      }
      if (!variant.ads || variant.ads.length < 3) {
        errors.push(`insufficient ads (${variant.ads?.length || 0})`);
      }
      if (variant.ads) {
        variant.ads.forEach((ad: any, adIndex: number) => {
          if (!ad.headlines || ad.headlines.length < 10) {
            errors.push(`ad ${adIndex}: insufficient headlines (${ad.headlines?.length || 0})`);
          }
          if (!ad.descriptions || ad.descriptions.length < 4) {
            errors.push(`ad ${adIndex}: insufficient descriptions (${ad.descriptions?.length || 0})`);
          }
        });
      }
      
      if (errors.length > 0) {
        console.error(`Variant ${index + 1} validation errors:`, errors);
        throw new Error(`Variant ${index + 1} incomplete: ${errors.join(", ")}`);
      }
    });

    console.log("All variants validated successfully");

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
