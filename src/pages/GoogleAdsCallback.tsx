import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const GoogleAdsCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        toast({
          title: 'Authentication failed',
          description: error,
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      if (!code) {
        toast({
          title: 'Invalid callback',
          description: 'No authorization code received',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      try {
        setStatus('Exchanging authorization code...');
        
        const { data, error: exchangeError } = await supabase.functions.invoke(
          'google-oauth-exchange',
          {
            body: { code },
          }
        );

        if (exchangeError) throw exchangeError;

        // Store tokens in localStorage
        localStorage.setItem('google_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('google_refresh_token', data.refresh_token);
        }
        localStorage.setItem('google_token_expiry', String(Date.now() + data.expires_in * 1000));

        toast({
          title: 'Connected successfully',
          description: 'Your Google Ads account is now connected',
        });

        navigate('/google-ads-dashboard');
      } catch (error: any) {
        console.error('OAuth exchange error:', error);
        toast({
          title: 'Connection failed',
          description: error.message || 'Failed to connect Google Ads account',
          variant: 'destructive',
        });
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default GoogleAdsCallback;
