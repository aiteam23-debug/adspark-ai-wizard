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
    const { url } = await req.json();

    if (!url) {
      throw new Error("URL is required");
    }

    console.log("Scraping URL:", url);
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdSparkBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    // Extract data using simple regex patterns
    const extractText = (pattern: RegExp): string[] => {
      const matches = html.match(pattern);
      return matches ? matches.map(m => m.replace(/<[^>]*>/g, '').trim()) : [];
    };

    // Extract headlines (h1, h2 tags)
    const headlines = extractText(/<h[12][^>]*>(.*?)<\/h[12]>/gi);
    
    // Extract meta description
    const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const description = metaDesc ? metaDesc[1] : '';

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract paragraphs
    const paragraphs = extractText(/<p[^>]*>(.*?)<\/p>/gi);

    // Extract lists
    const listItems = extractText(/<li[^>]*>(.*?)<\/li>/gi);

    // Try to extract testimonials (common patterns)
    const testimonials = extractText(/["']([^"']{50,200})["']\s*-\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi);

    // Extract stats/numbers
    const stats = html.match(/(\d+[KMB\+%]+)/gi) || [];

    // Build scraped data object
    const scrapedData = {
      url,
      title,
      description,
      headlines: headlines.slice(0, 5),
      paragraphs: paragraphs.slice(0, 10),
      listItems: listItems.slice(0, 15),
      testimonials: testimonials.slice(0, 5),
      stats: [...new Set(stats)].slice(0, 10),
      timestamp: new Date().toISOString(),
    };

    console.log("Scraping complete:", {
      headlinesCount: scrapedData.headlines.length,
      paragraphsCount: scrapedData.paragraphs.length,
      statsCount: scrapedData.stats.length,
    });

    return new Response(
      JSON.stringify(scrapedData),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in scrape-url function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to scrape URL",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
