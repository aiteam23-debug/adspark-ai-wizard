import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, MessageSquare, Hash, Search, Zap, Edit2, Check, Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdCampaignDisplayProps {
  response: string;
}

export const AdCampaignDisplay = ({ response }: AdCampaignDisplayProps) => {
  const { toast } = useToast();
  
  // Parse the response to extract sections
  const parseSection = (text: string, markers: string[]) => {
    for (const marker of markers) {
      const regex = new RegExp(`${marker}[:\\s]*([\\s\\S]*?)(?=\\n\\n|\\n(?:🎯|💬|🔖|🔍|🚀)|$)`, 'i');
      const match = text.match(regex);
      if (match) return match[1].trim();
    }
    return "";
  };

  const initialTitle = parseSection(response, ["🎯 Title:", "Title:", "Campaign Title:"]);
  const initialAdCopy = parseSection(response, ["💬 Ad Copy:", "Ad Copy:", "Description:"]);
  const initialHashtagsText = parseSection(response, ["🔖 Hashtags:", "Hashtags:"]);
  const initialKeywordsText = parseSection(response, ["🔍 Keywords:", "Keywords:"]);
  const initialCta = parseSection(response, ["🚀 CTA:", "CTA:", "Call to Action:"]);

  // Editable state
  const [title, setTitle] = useState(initialTitle);
  const [adCopy, setAdCopy] = useState(initialAdCopy);
  const [hashtagsText, setHashtagsText] = useState(initialHashtagsText);
  const [keywordsText, setKeywordsText] = useState(initialKeywordsText);
  const [cta, setCta] = useState(initialCta);

  // Edit mode state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAdCopy, setEditingAdCopy] = useState(false);
  const [editingHashtags, setEditingHashtags] = useState(false);
  const [editingKeywords, setEditingKeywords] = useState(false);
  const [editingCta, setEditingCta] = useState(false);

  const hashtags = hashtagsText.split(/[,\n]/).map(h => h.trim()).filter(h => h);
  const keywords = keywordsText.split(/[,\n]/).map(k => k.trim()).filter(k => k);

  const copyAllToClipboard = () => {
    const allContent = `
🎯 Title: ${title}

💬 Ad Copy:
${adCopy}

🔖 Hashtags: ${hashtags.join(', ')}

🔍 Keywords: ${keywords.join(', ')}

🚀 CTA: ${cta}
    `.trim();
    
    navigator.clipboard.writeText(allContent);
    toast({
      title: "Copied! 📋",
      description: "Campaign content copied to clipboard",
    });
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved! ✓",
      description: "Your edits have been saved",
    });
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20 animate-fade-in shadow-lg border-primary/10">
      {/* Title */}
      {title && (
        <div className="space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Campaign Title</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTitle(!editingTitle)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {editingTitle ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-heading font-bold"
              onBlur={() => setEditingTitle(false)}
              autoFocus
            />
          ) : (
            <h2 className="text-2xl font-heading font-bold text-primary">{title}</h2>
          )}
        </div>
      )}

      <Separator className="bg-primary/10" />

      {/* Ad Copy */}
      {adCopy && (
        <div className="space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ad Copy</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingAdCopy(!editingAdCopy)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {editingAdCopy ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingAdCopy ? (
            <Textarea
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value)}
              className="min-h-[120px] text-base font-body leading-relaxed"
              onBlur={() => setEditingAdCopy(false)}
              autoFocus
            />
          ) : (
            <p className="text-base font-body leading-relaxed whitespace-pre-line">{adCopy}</p>
          )}
        </div>
      )}

      <Separator className="bg-primary/10" />

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Hashtags</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingHashtags(!editingHashtags)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {editingHashtags ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingHashtags ? (
            <Input
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              placeholder="Separate with commas or new lines"
              onBlur={() => setEditingHashtags(false)}
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-sm px-3 py-1 hover-scale cursor-default">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Separator className="bg-primary/10" />

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Keywords</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingKeywords(!editingKeywords)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {editingKeywords ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingKeywords ? (
            <Input
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="Separate with commas or new lines"
              onBlur={() => setEditingKeywords(false)}
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-sm px-3 py-1 hover-scale cursor-default">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Separator className="bg-primary/10" />

      {/* CTA */}
      {cta && (
        <div className="space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Call to Action</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCta(!editingCta)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {editingCta ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingCta ? (
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="text-lg font-heading font-bold"
              onBlur={() => setEditingCta(false)}
              autoFocus
            />
          ) : (
            <p className="text-lg font-heading font-bold text-primary">{cta}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(title || adCopy || hashtags.length > 0 || keywords.length > 0 || cta) && (
        <>
          <Separator className="bg-primary/10" />
          <div className="flex gap-3 pt-2">
            <Button
              onClick={copyAllToClipboard}
              variant="outline"
              className="flex-1 hover-scale"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 btn-press bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </>
      )}

      {/* Fallback if no structured data */}
      {!title && !adCopy && !hashtags.length && !keywords.length && !cta && (
        <div className="text-sm text-muted-foreground whitespace-pre-line">{response}</div>
      )}
    </Card>
  );
};
