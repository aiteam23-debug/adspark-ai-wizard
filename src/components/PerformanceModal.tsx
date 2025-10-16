import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MousePointer, Eye, Target, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Campaign = Database['public']['Tables']['campaigns']['Row'];

interface PerformanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Campaign[];
}

export const PerformanceModal = ({ open, onOpenChange, campaigns }: PerformanceModalProps) => {
  const { toast } = useToast();
  const [copiedMetric, setCopiedMetric] = useState<string | null>(null);

  // Calculate total metrics
  const totalClicks = campaigns.reduce((sum, c) => sum + ((c.metrics as any)?.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + ((c.metrics as any)?.impressions || 0), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + ((c.metrics as any)?.spend || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  // Calculate CTR (Click Through Rate)
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMetric(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedMetric(null), 2000);
  };

  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    delay 
  }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    color: string; 
    delay: string;
  }) => (
    <Card 
      className={`card-lift ${delay}`}
      style={{ animationDelay: delay }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <CardTitle className="text-sm font-body text-muted-foreground">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-50 hover:opacity-100 transition-opacity"
            onClick={() => copyToClipboard(value.toString(), title)}
          >
            <Copy className={`w-4 h-4 ${copiedMetric === title ? 'text-green-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-heading font-bold">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-heading">
            <TrendingUp className="w-6 h-6 text-primary" />
            Campaign Performance
          </DialogTitle>
          <DialogDescription className="font-body">
            Overview of all your campaigns' performance metrics
          </DialogDescription>
        </DialogHeader>

        {campaigns.length === 0 ? (
          <div className="py-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              No performance data available
            </h3>
            <p className="text-muted-foreground font-body">
              Run a campaign to see stats here!
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={MousePointer}
                title="Total Clicks"
                value={totalClicks}
                color="bg-primary/10 text-primary"
                delay="animate-fade-in"
              />
              <MetricCard
                icon={Eye}
                title="Impressions"
                value={totalImpressions}
                color="bg-accent/10 text-accent"
                delay="animate-fade-in delay-100"
              />
              <MetricCard
                icon={TrendingUp}
                title="CTR"
                value={`${ctr}%`}
                color="bg-green-500/10 text-green-500"
                delay="animate-fade-in delay-200"
              />
              <MetricCard
                icon={Target}
                title="Active Campaigns"
                value={activeCampaigns}
                color="bg-blue-500/10 text-blue-500"
                delay="animate-fade-in delay-300"
              />
            </div>

            {/* Individual Campaign Performance */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold">
                Campaign Breakdown
              </h3>
              <div className="space-y-3">
                {campaigns.map((campaign, index) => {
                  const metrics = campaign.metrics as any;
                  const clicks = metrics?.clicks || 0;
                  const impressions = metrics?.impressions || 0;
                  const campaignCtr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

                  return (
                    <Card 
                      key={campaign.id} 
                      className="card-lift animate-fade-in"
                      style={{ animationDelay: `${(index + 4) * 100}ms` }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-heading font-semibold text-lg mb-1">
                              {campaign.name}
                            </h4>
                            <p className="text-sm text-muted-foreground font-body">
                              {campaign.description}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'active' 
                              ? 'bg-green-500/10 text-green-500' 
                              : campaign.status === 'paused'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground font-body">Clicks</span>
                            <p className="font-heading font-semibold text-lg mt-1">
                              {clicks.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-body">Impressions</span>
                            <p className="font-heading font-semibold text-lg mt-1">
                              {impressions.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-body">CTR</span>
                            <p className="font-heading font-semibold text-lg mt-1">
                              {campaignCtr}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-body">Budget</span>
                            <p className="font-heading font-semibold text-lg mt-1">
                              ${campaign.budget_daily?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-body">Keywords</span>
                            <p className="font-heading font-semibold text-lg mt-1">
                              {campaign.keywords?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
