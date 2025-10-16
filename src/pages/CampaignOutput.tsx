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
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(39_100%_5%)] to-background relative overflow-hidden">
      {/* Animated background elements with warm colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(39_100%_58%)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(16_100%_66%)]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[hsl(172_100%_41%)]/5 rounded-full blur-3xl animate-pulse delay-300"></div>
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
        <Card className="p-8 mb-6 card-lift bg-gradient-to-br from-[hsl(39_100%_5%)] to-[hsl(16_100%_5%)] border-[hsl(39_100%_58%)]/30 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(39_100%_58%)]/5 via-transparent to-[hsl(16_100%_66%)]/5 animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(39_100%_58%)] to-[hsl(16_100%_66%)] flex items-center justify-center shadow-lg shadow-[hsl(39_100%_58%)]/20">
                  <Sparkles className="w-6 h-6 text-background" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">✨ Campaign Title</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.title, "Title")}
                className="hover:bg-[hsl(39_100%_58%)]/10"
              >
                {copiedSection === "Title" ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-gradient-warm leading-tight drop-shadow-lg">
              {campaignData.title}
            </h1>
          </div>
        </Card>

        {/* Ad Copy Section */}
        <Card className="p-8 mb-6 card-lift bg-gradient-to-br from-[hsl(172_100%_5%)] to-[hsl(39_100%_5%)] border-[hsl(172_100%_41%)]/30 animate-fade-in delay-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(172_100%_41%)] to-[hsl(39_100%_58%)] flex items-center justify-center shadow-lg shadow-[hsl(172_100%_41%)]/20">
                <Megaphone className="w-6 h-6 text-background" />
              </div>
              <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">📝 Ad Copy</h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(campaignData.adCopy, "Ad Copy")}
              className="hover:bg-[hsl(172_100%_41%)]/10"
            >
              {copiedSection === "Ad Copy" ? (
                <CheckCircle2 className="w-4 h-4 text-[hsl(172_100%_41%)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 border border-[hsl(172_100%_41%)]/10">
            <p className="text-lg font-body text-foreground/90 leading-relaxed">
              {campaignData.adCopy}
            </p>
          </div>
        </Card>

        {/* Two column layout for Hashtags and Keywords */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Hashtags Section */}
          <Card className="p-6 card-lift bg-gradient-to-br from-[hsl(16_100%_5%)] to-[hsl(48_96%_5%)] border-[hsl(16_100%_66%)]/30 animate-fade-in delay-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(16_100%_66%)] to-[hsl(48_96%_53%)] flex items-center justify-center shadow-lg shadow-[hsl(16_100%_66%)]/20">
                  <Hash className="w-5 h-5 text-background" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">🔖 Hashtags</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.hashtags, "Hashtags")}
                className="hover:bg-[hsl(16_100%_66%)]/10"
              >
                {copiedSection === "Hashtags" ? (
                  <CheckCircle2 className="w-4 h-4 text-[hsl(16_100%_66%)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {hashtags.map((tag, index) => {
                const colors = [
                  "from-[hsl(39_100%_58%)] to-[hsl(39_100%_48%)] shadow-[hsl(39_100%_58%)]/20",
                  "from-[hsl(16_100%_66%)] to-[hsl(16_100%_56%)] shadow-[hsl(16_100%_66%)]/20",
                  "from-[hsl(48_96%_53%)] to-[hsl(48_96%_43%)] shadow-[hsl(48_96%_53%)]/20",
                  "from-[hsl(172_100%_41%)] to-[hsl(172_100%_31%)] shadow-[hsl(172_100%_41%)]/20",
                  "from-[hsl(0_73%_67%)] to-[hsl(0_73%_57%)] shadow-[hsl(0_73%_67%)]/20",
                ];
                return (
                  <span
                    key={index}
                    className={`px-4 py-2 bg-gradient-to-br ${colors[index % colors.length]} rounded-full text-sm font-semibold text-background hover:scale-110 transition-all duration-300 cursor-default shadow-lg hover:shadow-xl`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </Card>

          {/* Keywords Section */}
          <Card className="p-6 card-lift bg-gradient-to-br from-[hsl(48_96%_5%)] to-[hsl(172_100%_5%)] border-[hsl(48_96%_53%)]/30 animate-fade-in delay-300">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(48_96%_53%)] to-[hsl(172_100%_41%)] flex items-center justify-center shadow-lg shadow-[hsl(48_96%_53%)]/20">
                  <Target className="w-5 h-5 text-background" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">🔍 Keywords</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.keywords, "Keywords")}
                className="hover:bg-[hsl(48_96%_53%)]/10"
              >
                {copiedSection === "Keywords" ? (
                  <CheckCircle2 className="w-4 h-4 text-[hsl(48_96%_53%)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaignData.keywords.split(",").map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-[hsl(48_96%_53%)]/20 hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[hsl(48_96%_53%)] to-[hsl(172_100%_41%)] shadow-sm"></div>
                  <span className="text-sm font-medium text-foreground/90">{keyword.trim()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-10 card-lift bg-gradient-to-r from-[hsl(39_100%_58%)] via-[hsl(16_100%_66%)] to-[hsl(0_73%_67%)] border-0 text-center animate-fade-in delay-400 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 mx-auto">
                <div className="w-14 h-14 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-pulse">
                  <Zap className="w-7 h-7 text-background" />
                </div>
                <h2 className="text-sm font-heading font-semibold text-background/90 uppercase tracking-wide">🎯 Call to Action</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(campaignData.cta, "CTA")}
                className="hover:bg-background/20 text-background"
              >
                {copiedSection === "CTA" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-3xl md:text-5xl font-heading font-extrabold text-background drop-shadow-lg animate-pulse">
              {campaignData.cta}
            </p>
          </div>
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
        
        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CampaignOutput;
