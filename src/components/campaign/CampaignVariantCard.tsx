import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface CampaignVariant {
  campaign_name: string;
  strategy: string;
  keywords: string[];
  ad_variations: Array<{
    headlines: string[];
    descriptions: string[];
  }>;
  targeting: {
    locations: string[];
    demographics: {
      age: string;
      gender: string;
      interests: string[];
    };
  };
  bidding: {
    strategy: string;
    bid_amount: number;
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
            {variant.campaign_name}
          </h4>
          <p className="text-sm text-muted-foreground font-body">
            {variant.strategy}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h5 className="text-sm font-heading font-semibold mb-2">
            Sample Ad Preview
          </h5>
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="space-y-1">
              {variant.ad_variations[0].headlines.map((headline, i) => (
                <p key={i} className="text-sm font-semibold text-primary">
                  {headline}
                </p>
              ))}
            </div>
            <div className="space-y-1">
              {variant.ad_variations[0].descriptions.map((desc, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {desc}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-heading font-semibold mb-2">
            Top Keywords
          </h5>
          <div className="flex flex-wrap gap-1">
            {variant.keywords.slice(0, 5).map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {variant.keywords.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{variant.keywords.length - 5} more
              </Badge>
            )}
          </div>

          <h5 className="text-sm font-heading font-semibold mb-2 mt-4">
            Targeting
          </h5>
          <div className="text-xs space-y-1 text-muted-foreground font-body">
            <p>Age: {variant.targeting.demographics.age}</p>
            <p>Gender: {variant.targeting.demographics.gender}</p>
            <p>Locations: {variant.targeting.locations.join(", ")}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm font-body">
          <span className="text-muted-foreground">Bid Strategy: </span>
          <span className="font-semibold">{variant.bidding.strategy}</span>
        </div>
        <div className="text-sm font-body">
          <span className="text-muted-foreground">Suggested Bid: </span>
          <span className="font-heading font-bold text-primary">
            ${variant.bidding.bid_amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground font-body">
        {variant.ad_variations.length} ad variations • {variant.keywords.length} keywords
      </div>
    </Card>
  );
};
