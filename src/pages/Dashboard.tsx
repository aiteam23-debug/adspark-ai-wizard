import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check auth status
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold">AdSpark AI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-body">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="font-body"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 page-transition">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Welcome back, {user?.user_metadata?.name || "there"}! ✨
          </h1>
          <p className="text-xl text-muted-foreground font-body">
            Ready to spark some sales?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 card-lift cursor-pointer hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">New Campaign</h3>
                <p className="text-sm text-muted-foreground font-body">Create with AI</p>
              </div>
            </div>
            <Button className="w-full btn-press bg-primary hover:bg-primary/90 text-primary-foreground font-heading">
              Get Started
            </Button>
          </Card>

          <Card className="p-6 card-lift">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">Performance</h3>
                <p className="text-sm text-muted-foreground font-body">This week</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-body">Clicks</span>
                <span className="font-heading font-semibold">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-body">Impressions</span>
                <span className="font-heading font-semibold">-</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-lift">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">Active Campaigns</h3>
                <p className="text-sm text-muted-foreground font-body">Currently running</p>
              </div>
            </div>
            <div className="text-3xl font-heading font-bold text-primary">0</div>
          </Card>
        </div>

        {/* Empty State */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary animate-sparkle" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-3">
              No campaigns yet
            </h2>
            <p className="text-muted-foreground mb-6 font-body">
              Create your first AI-powered Google Ads campaign in just 5 minutes.
              Our AI will handle everything from keywords to ad copy.
            </p>
            <Button className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
