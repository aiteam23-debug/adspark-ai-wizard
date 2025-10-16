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
    <Card className="p-8 space-y-8 bg-gradient-to-br from-card via-card to-muted/30 animate-fade-in shadow-xl border-2 border-primary/20 backdrop-blur-sm">
      {/* Title */}
      {title && (
        <div className="space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campaign Title</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTitle(!editingTitle)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
            >
              {editingTitle ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-heading font-bold border-2 border-primary focus:border-primary"
              onBlur={() => setEditingTitle(false)}
              autoFocus
            />
          ) : (
            <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
              {title}
            </h2>
          )}
        </div>
      )}

      <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Ad Copy */}
      {adCopy && (
        <div className="space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ad Copy</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingAdCopy(!editingAdCopy)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
            >
              {editingAdCopy ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingAdCopy ? (
            <Textarea
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value)}
              className="min-h-[140px] text-base font-body leading-relaxed border-2 border-primary focus:border-primary resize-none"
              onBlur={() => setEditingAdCopy(false)}
              autoFocus
            />
          ) : (
            <div className="bg-muted/30 rounded-xl p-5 border border-primary/10">
              <p className="text-base font-body leading-relaxed whitespace-pre-line text-foreground/90">{adCopy}</p>
            </div>
          )}
        </div>
      )}

      <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hashtags</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingHashtags(!editingHashtags)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
            >
              {editingHashtags ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingHashtags ? (
            <Input
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              placeholder="Separate with commas or new lines"
              className="border-2 border-primary focus:border-primary"
              onBlur={() => setEditingHashtags(false)}
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {hashtags.map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-sm px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 hover:scale-105 cursor-default font-medium"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keywords</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingKeywords(!editingKeywords)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
            >
              {editingKeywords ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingKeywords ? (
            <Input
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="Separate with commas or new lines"
              className="border-2 border-primary focus:border-primary"
              onBlur={() => setEditingKeywords(false)}
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-sm px-3 py-1.5 bg-background hover:bg-muted border-primary/30 transition-all duration-200 hover:scale-105 cursor-default"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* CTA */}
      {cta && (
        <div className="space-y-4 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Call to Action</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCta(!editingCta)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
            >
              {editingCta ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
          {editingCta ? (
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="text-xl font-heading font-bold border-2 border-primary focus:border-primary"
              onBlur={() => setEditingCta(false)}
              autoFocus
            />
          ) : (
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl p-5 border-2 border-primary/30">
              <p className="text-xl font-heading font-bold text-primary text-center">{cta}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(title || adCopy || hashtags.length > 0 || keywords.length > 0 || cta) && (
        <>
          <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex gap-4 pt-2">
            <Button
              onClick={copyAllToClipboard}
              variant="outline"
              className="flex-1 h-12 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
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
