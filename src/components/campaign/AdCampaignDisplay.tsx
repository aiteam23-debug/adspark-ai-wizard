import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Hash, Search, Zap } from "lucide-react";

interface AdCampaignDisplayProps {
  response: string;
}

export const AdCampaignDisplay = ({ response }: AdCampaignDisplayProps) => {
  // Parse the response to extract sections
  const parseSection = (text: string, markers: string[]) => {
    for (const marker of markers) {
      const regex = new RegExp(`${marker}[:\\s]*([\\s\\S]*?)(?=\\n\\n|\\n(?:🎯|💬|🔖|🔍|🚀)|$)`, 'i');
      const match = text.match(regex);
      if (match) return match[1].trim();
    }
    return "";
  };

  const title = parseSection(response, ["🎯 Title:", "Title:", "Campaign Title:"]);
  const adCopy = parseSection(response, ["💬 Ad Copy:", "Ad Copy:", "Description:"]);
  const hashtagsText = parseSection(response, ["🔖 Hashtags:", "Hashtags:"]);
  const keywordsText = parseSection(response, ["🔍 Keywords:", "Keywords:"]);
  const cta = parseSection(response, ["🚀 CTA:", "CTA:", "Call to Action:"]);

  const hashtags = hashtagsText.split(/[,\n]/).map(h => h.trim()).filter(h => h);
  const keywords = keywordsText.split(/[,\n]/).map(k => k.trim()).filter(k => k);

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20">
      {/* Title */}
      {title && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Campaign Title</h3>
          </div>
          <h2 className="text-2xl font-heading font-bold text-primary">{title}</h2>
        </div>
      )}

      <Separator />

      {/* Ad Copy */}
      {adCopy && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ad Copy</h3>
          </div>
          <p className="text-base font-body leading-relaxed whitespace-pre-line">{adCopy}</p>
        </div>
      )}

      <Separator />

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Hashtags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-sm px-3 py-1">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* CTA */}
      {cta && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Call to Action</h3>
          </div>
          <p className="text-lg font-heading font-bold text-primary">{cta}</p>
        </div>
      )}

      {/* Fallback if no structured data */}
      {!title && !adCopy && !hashtags.length && !keywords.length && !cta && (
        <div className="text-sm text-muted-foreground whitespace-pre-line">{response}</div>
      )}
    </Card>
  );
};
