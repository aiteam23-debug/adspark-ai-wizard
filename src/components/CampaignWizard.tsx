import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";
import { CampaignVariantCard } from "./campaign/CampaignVariantCard";
import { AdCampaignDisplay } from "./campaign/AdCampaignDisplay";

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

interface CampaignWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  draftId?: string;
}

export const CampaignWizard = ({ onClose, onSuccess, initialData, draftId }: CampaignWizardProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<number | null>(null);

  // Step 1 - Input (Enhanced with more fields)
  const [formData, setFormData] = useState(initialData || {
    businessDescription: "",
    targetAudience: "",
    budget: "",
    goals: "",
    websiteUrl: "",
    campaignType: "Search",
    sitelinks: ["", "", "", ""],
    callouts: ["", "", "", ""],
    snippetHeader: "",
    snippetValues: ["", "", "", "", ""],
    negativeKeywords: "",
    adSchedule: { startHour: 0, endHour: 23, days: [] as string[] },
    landingPageUrl: "",
    advancedTargeting: {
      incomeLevel: "",
      parentalStatus: "",
    },
  });

  // Step 2 - Generated variants
  const [variants, setVariants] = useState<CampaignVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [n8nResponse, setN8nResponse] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    scheduleAutoSave();
  };

  // Auto-save functionality
  const scheduleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      saveDraft();
    }, 30000); // Auto-save after 30 seconds of inactivity
  };

  const saveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (draftId) {
        // Update existing draft
        await supabase
          .from('drafts')
          .update({ campaign_data: formData })
          .eq('id', draftId);
      } else {
        // Create new draft
        await supabase
          .from('drafts')
          .insert({ 
            user_id: user.id,
            campaign_data: formData 
          });
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const scrapeUrl = async () => {
    if (!formData.websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url: formData.websiteUrl }
      });

      if (error) throw error;

      setScrapedData(data);
      setQuickMode(true);
      
      // Auto-fill some fields from scraped data
      setFormData(prev => ({
        ...prev,
        businessDescription: prev.businessDescription || data.description || data.title,
      }));

      toast({
        title: "URL Scraped! 🎯",
        description: "Website data extracted. Click Generate for curated campaigns.",
      });
    } catch (error: any) {
      console.error('Error scraping URL:', error);
      toast({
        title: "Scraping Failed",
        description: "Couldn't scrape URL. You can still generate campaigns manually.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const validateStep1 = () => {
    const { businessDescription, targetAudience, budget, goals, websiteUrl } = formData;
    
    if (!businessDescription.trim()) {
      toast({ title: "Error", description: "Please describe your business", variant: "destructive" });
      return false;
    }
    if (!targetAudience.trim()) {
      toast({ title: "Error", description: "Please describe your target audience", variant: "destructive" });
      return false;
    }
    if (!budget || parseFloat(budget) <= 0) {
      toast({ title: "Error", description: "Please enter a valid budget greater than $0", variant: "destructive" });
      return false;
    }
    if (!goals.trim()) {
      toast({ title: "Error", description: "Please describe your campaign goals", variant: "destructive" });
      return false;
    }
    if (!websiteUrl.trim() || !websiteUrl.includes('.')) {
      toast({ title: "Error", description: "Please enter a valid website URL", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const generateCampaigns = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      // Send data to n8n webhook
      const n8nPayload = {
        businessDescription: formData.businessDescription,
        targetAudience: formData.targetAudience,
        dailyBudget: formData.budget,
        websiteUrl: formData.websiteUrl,
        campaignGoals: formData.goals
      };

      let n8nData = "";
      try {
        const n8nResponse = await fetch('https://vedant0409kasat.app.n8n.cloud/webhook/4de14b93-8334-4a09-ac3f-f680b9863486', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload)
        });

        if (n8nResponse.ok) {
          n8nData = await n8nResponse.text();
          setN8nResponse(n8nData);
          console.log("n8n response received:", n8nData);
        } else {
          console.error("n8n webhook failed:", n8nResponse.status);
          throw new Error('Failed to pitch - n8n webhook error');
        }
      } catch (n8nError: any) {
        console.error("n8n error:", n8nError);
        throw new Error(`Failed to pitch: ${n8nError.message}`);
      }

      console.log("Calling generate-campaign function...");
      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: { 
          ...formData,
          scrapedData,
          quickMode 
        }
      });

      console.log("generate-campaign response:", data, error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Generation failed: ${error.message}`);
      }

      if (data?.error) {
        console.error("AI generation error:", data.error);
        throw new Error(data.error);
      }

      // The function returns { variants: [...] }
      if (!data?.variants || !Array.isArray(data.variants) || data.variants.length === 0) {
        console.error("Invalid data structure:", data);
        throw new Error('No campaign variants generated');
      }

      setVariants(data.variants);
      setStep(2);
      toast({
        title: "Success! ✨",
        description: "Campaign data sent to n8n and variants generated!",
      });
    } catch (error: any) {
      console.error("Error generating campaigns:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async () => {
    if (selectedVariant === null) {
      toast({ title: "Error", description: "Please select a campaign variant", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const variant = variants[selectedVariant];
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('campaigns').insert({
        user_id: user.id,
        name: variant.campaign_name,
        description: variant.strategy,
        status: 'draft',
        budget_daily: parseFloat(formData.budget),
        target_audience: {
          description: formData.targetAudience,
          ...variant.targeting
        },
        keywords: variant.keywords,
        ad_variations: variant.ad_variations,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0
        }
      });

      if (error) throw error;

      toast({
        title: "Campaign Saved! 🎉",
        description: "Your campaign has been saved as a draft.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-sparkle" />
            <div>
              <h2 className="text-2xl font-heading font-bold">AI Campaign Wizard</h2>
              <p className="text-sm text-muted-foreground font-body">
                Step {step} of 3
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Input */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Show n8n response if available */}
            {n8nResponse && (
              <div className="p-4 bg-muted rounded-lg border border-border animate-fade-in">
                <h4 className="font-heading font-semibold mb-2">AI Campaign Strategy</h4>
                <AdCampaignDisplay response={n8nResponse} />
              </div>
            )}

            <div>
              <Label htmlFor="business" className="font-body font-medium">
                Business Description *
              </Label>
              <Textarea
                id="business"
                placeholder="E.g., We sell eco-friendly yoga mats and fitness accessories"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="audience" className="font-body font-medium">
                Target Audience *
              </Label>
              <Textarea
                id="audience"
                placeholder="E.g., Health-conscious millennials aged 25-40, primarily women, interested in yoga and wellness"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget" className="font-body font-medium">
                  Daily Budget ($) *
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="50"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="mt-2"
                />
              </div>

            <div>
              <Label htmlFor="website" className="font-body font-medium">
                Website URL *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={scrapeUrl}
                  disabled={loading || !formData.websiteUrl}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Quick Scrape
                </Button>
              </div>
              {scrapedData && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ URL scraped! Generating curated campaigns...
                </p>
              )}
            </div>
            </div>

            <div>
              <Label htmlFor="goals" className="font-body font-medium">
                Campaign Goals *
              </Label>
              <Textarea
                id="goals"
                placeholder="E.g., Increase online sales by 30%, generate 100+ qualified leads per month"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={generateCampaigns}
                disabled={loading}
                className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {n8nResponse ? 'Generating Campaign Previews...' : 'Generating Preview...'}
                  </>
                ) : (
                  <>
                    Generate Campaign Preview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Review Variants */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-heading font-bold mb-2">
                Choose Your Campaign Variant
              </h3>
              <p className="text-muted-foreground font-body">
                Our AI generated 3 unique campaign strategies. Select the one that best fits your goals.
              </p>
            </div>

            {n8nResponse && (
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold mb-4">AI-Generated Campaign Strategy</h3>
                <AdCampaignDisplay response={n8nResponse} />
              </div>
            )}

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <CampaignVariantCard
                  key={index}
                  variant={variant}
                  index={index}
                  isSelected={selectedVariant === index}
                  onSelect={() => setSelectedVariant(index)}
                />
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedVariant === null || loading}
                className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Review & Launch
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Review */}
        {step === 3 && selectedVariant !== null && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">
                Ready to Launch?
              </h3>
              <p className="text-muted-foreground font-body">
                Review your campaign details before saving
              </p>
            </div>

            <CampaignVariantCard
              variant={variants[selectedVariant]}
              index={selectedVariant}
              isSelected={true}
              onSelect={() => {}}
            />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-heading font-semibold mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-body">
                <li>✓ Campaign will be saved as a draft in your dashboard</li>
                <li>✓ You can edit details anytime before launching</li>
                <li>✓ Connect Google Ads to launch live campaigns</li>
                <li>✓ Track performance in real-time</li>
              </ul>
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={saveCampaign}
                disabled={loading}
                className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
