import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle2, Sparkles, ArrowLeft, RotateCw, Hash, Target, Zap, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignData {
  title: string;
  adCopy: string;
  hashtags: string;
  keywords: string;
  cta: string;
}

const CampaignOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const campaignData: CampaignData = location.state?.campaignData || {
    title: "Flavorful Gujarati Munchies: Snack Happy with BiteBaazi!",
    adCopy: "Discover the authentic taste of Gujarat with BiteBaazi's crunchy khakras, crispy dry samosas, spicy dry kachoris, and unique beetroot chips. Perfect for students and snack lovers who crave flavorful, guilt-free munching anytime, anywhere!",
    hashtags: "#GujaratiSnacks #BiteBaaziMagic #SnackTime #MunchiesDelight #CrunchAndFlavor #KhakraLovers #HealthySnacks #SnackSmart #TasteOfGujarat #BeetrootChips",
    keywords: "Gujarati snacks, khakra flavors, dry samosa, dry kachori, beetroot chips, healthy munchies, Indian snacks online, snack delivery, tasty Gujarati snacks, youth snacks, crunchy snacks, snack lovers",
    cta: "Snack Boldly, Click & Crunch Now!"
  };

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`,
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const copyAll = async () => {
    const allContent = `
Title: ${campaignData.title}

Ad Copy:
${campaignData.adCopy}

Hashtags:
${campaignData.hashtags}

Keywords:
${campaignData.keywords}

CTA: ${campaignData.cta}
    `.trim();

    await copyToClipboard(allContent, "Entire Campaign");
  };

  const hashtags = campaignData.hashtags.split(" ").filter(tag => tag.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-out"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animation: `fall ${2 + Math.random() * 2}s linear`,
                fontSize: '24px',
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={copyAll}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </Button>
        </div>

        {/* Success badge */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border-2 border-primary/30 mb-4">
            <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
            <span className="font-heading font-bold text-lg">Campaign Generated Successfully!</span>
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
        </div>

        {/* Campaign Title Section */}
        <Card className="p-8 mb-6 card-lift bg-gradient-to-br from-background to-primary/5 border-primary/20 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Campaign Title</h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(campaignData.title, "Title")}
              className="hover:bg-primary/10"
            >
              {copiedSection === "Title" ? (
                <CheckCircle2 className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight">
            {campaignData.title}
          </h1>
        </Card>

        {/* Ad Copy Section */}
        <Card className="p-8 mb-6 card-lift bg-gradient-to-br from-background to-accent/5 border-accent/20 animate-fade-in delay-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Ad Copy</h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(campaignData.adCopy, "Ad Copy")}
              className="hover:bg-accent/10"
            >
              {copiedSection === "Ad Copy" ? (
                <CheckCircle2 className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-lg font-body text-foreground/90 leading-relaxed">
            {campaignData.adCopy}
          </p>
        </Card>

        {/* Two column layout for Hashtags and Keywords */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Hashtags Section */}
          <Card className="p-6 card-lift bg-gradient-to-br from-background to-primary/5 border-primary/20 animate-fade-in delay-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Hashtags</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.hashtags, "Hashtags")}
                className="hover:bg-primary/10"
              >
                {copiedSection === "Hashtags" ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full text-sm font-medium text-foreground hover:scale-105 transition-transform cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          {/* Keywords Section */}
          <Card className="p-6 card-lift bg-gradient-to-br from-background to-accent/5 border-accent/20 animate-fade-in delay-300">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/80 to-primary/80 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent-foreground" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">Keywords</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.keywords, "Keywords")}
                className="hover:bg-accent/10"
              >
                {copiedSection === "Keywords" ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {campaignData.keywords.split(",").map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-body text-foreground/80"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  <span>{keyword.trim()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 card-lift bg-gradient-to-r from-primary via-accent to-primary border-0 text-center animate-fade-in delay-400">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 mx-auto">
              <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-sm font-heading font-semibold text-primary-foreground/90 uppercase tracking-wide">Call to Action</h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(campaignData.cta, "CTA")}
              className="hover:bg-background/20 text-primary-foreground"
            >
              {copiedSection === "CTA" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
            {campaignData.cta}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in delay-500">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10"
            onClick={() => navigate(-1)}
          >
            <RotateCw className="w-5 h-5" />
            Generate New Campaign
          </Button>
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default CampaignOutput;
