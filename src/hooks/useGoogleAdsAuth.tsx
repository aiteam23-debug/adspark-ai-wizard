export const useGoogleAdsAuth = () => {
  const GOOGLE_CLIENT_ID = '240860261239-sc0m2bgb4fauh28l5bg55kqqbf177o7o.apps.googleusercontent.com';
  const GOOGLE_REDIRECT_URI = 'https://preview--adspark-ai-wizard.lovable.app/auth/callback';
  const SCOPES = [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const initiateGoogleAuth = () => {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  };

  const isConnected = () => {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (!token || !expiry) return false;
    
    return Date.now() < parseInt(expiry);
  };

  const disconnect = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
  };

  return {
    initiateGoogleAuth,
    isConnected: isConnected(),
    disconnect,
  };
};
