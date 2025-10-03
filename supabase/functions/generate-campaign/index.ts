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

    const systemPrompt = `You are an expert Google Ads campaign optimizer. Generate highly effective Google Ads campaigns based on user input.

CRITICAL RULES:
- Generate exactly 3 campaign variants
- Each variant must be UNIQUE with different strategies
- Headlines: Max 30 characters each
- Descriptions: Max 90 characters each
- Keywords must be high-intent, specific to the business
- Ensure all content is truthful and compliant (no guarantees, no misleading claims)
- Target diverse audience segments across variants

Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "variants": [
    {
      "campaign_name": "Campaign Name Here",
      "strategy": "Brief strategy description",
      "keywords": ["keyword1", "keyword2", ...] (10 keywords),
      "ad_variations": [
        {
          "headlines": ["Headline 1", "Headline 2", "Headline 3"],
          "descriptions": ["Description 1", "Description 2"]
        }
      ] (5 ad variations),
      "targeting": {
        "locations": ["Location 1", "Location 2"],
        "demographics": {
          "age": "Age range",
          "gender": "ALL/MALE/FEMALE",
          "interests": ["Interest 1", "Interest 2"]
        }
      },
      "bidding": {
        "strategy": "manual_cpc",
        "bid_amount": number (in dollars)
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
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
