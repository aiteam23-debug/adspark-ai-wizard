import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { GoogleAdPreview } from "./GoogleAdPreview";

interface CampaignVariant {
  campaign_name: string;
  strategy: string;
  budget?: {
    daily_micros: number;
    pacing: string;
  };
  bidding?: {
    strategy: string;
    initial_bid_micros?: number;
    bid_amount?: number;
  };
  keywords?: {
    positive: string[];
    negative: string[];
  } | string[];
  targeting?: {
    locations: string[];
    demographics?: {
      age?: string;
      age_ranges?: string[];
      gender?: string;
      genders?: string[];
      incomes?: string[];
      interests?: string[];
    };
    devices?: string;
    schedule?: {
      start_hour: number;
      end_hour: number;
      days: string[];
    };
  };
  ad_groups?: Array<{
    name: string;
    keywords_subset: string[];
    cpc_bid_micros: number;
  }>;
  ads?: Array<{
    headlines: string[];
    descriptions: string[];
    paths?: string[];
    extensions?: {
      sitelinks?: Array<{ text: string; url: string }>;
      callouts?: string[];
      snippets?: {
        header: string;
        values: string[];
      };
    };
  }>;
  ad_variations?: Array<{
    headlines: string[];
    descriptions: string[];
  }>;
  performance_estimate?: {
    simulated_ctr: number;
    est_impressions: number;
    est_clicks: number;
  };
}

interface CampaignVariantCardProps {
  variant: CampaignVariant;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const CampaignVariantCard = ({
  variant,
  index,
  isSelected,
  onSelect,
}: CampaignVariantCardProps) => {
  // Defensive checks for data structure - support both old and new format
  const hasAds = variant?.ads && variant.ads.length > 0;
  const hasAdVariations = variant?.ad_variations && variant.ad_variations.length > 0;
  const firstAd = hasAds ? variant.ads[0] : (hasAdVariations ? variant.ad_variations[0] : null);
  
  // Extract keywords - handle both array and object format
  const keywords = Array.isArray(variant?.keywords) 
    ? variant.keywords 
    : (variant?.keywords as any)?.positive || [];
  
  // Calculate bid amount from micros if needed
  const bidAmount = variant?.bidding?.bid_amount 
    || (variant?.bidding?.initial_bid_micros ? variant.bidding.initial_bid_micros / 1000000 : 0);
  
  return (
    <Card
      className={`p-6 cursor-pointer transition-all ${
        isSelected
          ? "border-primary border-2 shadow-lg"
          : "border-border hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-heading">
              Variant {index + 1}
            </Badge>
            {isSelected && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <h4 className="text-lg font-heading font-bold mb-1">
            {variant?.campaign_name || "Untitled Campaign"}
          </h4>
          <p className="text-sm text-muted-foreground font-body">
            {variant?.strategy || "No strategy defined"}
          </p>
        </div>
      </div>

      {firstAd && (
        <div className="mb-4">
          <h5 className="text-sm font-heading font-semibold mb-3">
            Pixel-Perfect Google Ad Preview
          </h5>
          <GoogleAdPreview
            headlines={firstAd.headlines || []}
            descriptions={firstAd.descriptions || []}
            displayUrl={variant?.targeting?.locations?.[0] || "example.com"}
            sitelinks={hasAds ? variant.ads[0]?.extensions?.sitelinks : undefined}
            callouts={hasAds ? variant.ads[0]?.extensions?.callouts : undefined}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h5 className="text-sm font-heading font-semibold mb-2">
            Top Keywords
          </h5>
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 5).map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {keywords.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{keywords.length - 5} more
              </Badge>
            )}
            {keywords.length === 0 && (
              <p className="text-xs text-muted-foreground">No keywords available</p>
            )}
          </div>

          <h5 className="text-sm font-heading font-semibold mb-2 mt-4">
            Targeting
          </h5>
          <div className="text-xs space-y-1 text-muted-foreground font-body">
            <p>Age: {variant?.targeting?.demographics?.age_ranges?.join(", ") || variant?.targeting?.demographics?.age || "Not specified"}</p>
            <p>Gender: {variant?.targeting?.demographics?.genders?.join(", ") || variant?.targeting?.demographics?.gender || "Not specified"}</p>
            <p>Locations: {variant?.targeting?.locations?.join(", ") || "Not specified"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm font-body">
          <span className="text-muted-foreground">Bid Strategy: </span>
          <span className="font-semibold">{variant?.bidding?.strategy || "Not specified"}</span>
        </div>
        <div className="text-sm font-body">
          <span className="text-muted-foreground">Suggested Bid: </span>
          <span className="font-heading font-bold text-primary">
            ${bidAmount?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground font-body">
        {(variant?.ads?.length || variant?.ad_variations?.length || 0)} ad variations • {keywords.length} keywords
        {variant?.performance_estimate && (
          <> • Est. CTR: {(variant.performance_estimate.simulated_ctr * 100).toFixed(2)}%</>
        )}
      </div>
    </Card>
  );
};
