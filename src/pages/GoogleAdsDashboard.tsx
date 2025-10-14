import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CampaignData {
  name: string;
  clicks: number;
  impressions: number;
  cost: number;
  avgCpc: number;
}

const GoogleAdsDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchCampaignData = async () => {
    const accessToken = localStorage.getItem('google_access_token');
    
    if (!accessToken) {
      toast({
        title: 'Not connected',
        description: 'Please connect your Google Ads account first',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke(
        'fetch-google-ads-data',
        {
          body: { accessToken },
        }
      );

      if (error) throw error;

      setCampaigns(data.campaigns || []);
      setIsConnected(true);
    } catch (error: any) {
      console.error('Failed to fetch campaign data:', error);
      toast({
        title: 'Failed to fetch data',
        description: error.message || 'Unable to retrieve Google Ads data',
        variant: 'destructive',
      });
      
      // If token is invalid, clear it
      if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
        localStorage.removeItem('google_token_expiry');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount / 1000000); // Convert micros to INR
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Google Ads Dashboard</h1>
              {isConnected && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Connected to Google Ads</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={fetchCampaignData}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading campaign data...</p>
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">No campaigns found in your Google Ads account</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Overview of your Google Ads campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Avg. CPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.avgCpc)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GoogleAdsDashboard;
