import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Target, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold text-foreground">AdSpark AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl page-transition">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-sparkle" />
            <span className="text-sm font-medium text-primary">AI-Powered Google Ads Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
            Spark Your Sales with
            <span className="text-primary"> AI-Powered</span>
            <br />Google Ads
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-body">
            No Expertise Needed. Enter your product idea, pick your audience, set a budget—our AI builds and launches your campaign.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 font-heading font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="btn-press text-lg px-8 py-6 font-heading font-semibold border-primary/30 hover:bg-primary/5">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              From Idea to Live Ads in <span className="text-accent">5 Minutes</span>
            </h2>
            <p className="text-xl text-muted-foreground font-body">
              Three simple steps to launch your Google Ads campaign
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 card-lift bg-background border-primary/10 hover:border-primary/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">1. Describe Your Product</h3>
              <p className="text-muted-foreground font-body">
                Simply tell us what you're selling in 1-2 sentences. No technical jargon needed.
              </p>
            </Card>

            <Card className="p-8 card-lift bg-background border-accent/10 hover:border-accent/30">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">2. AI Does the Magic</h3>
              <p className="text-muted-foreground font-body">
                Our AI creates optimized campaigns, keywords, and ad copy tailored to your audience.
              </p>
            </Card>

            <Card className="p-8 card-lift bg-background border-primary/10 hover:border-primary/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">3. Launch & Grow</h3>
              <p className="text-muted-foreground font-body">
                Review, tweak if needed, and launch. Track performance in real-time from your dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground font-body">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 card-lift border-primary/20">
              <div className="mb-6">
                <h3 className="text-2xl font-heading font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-heading font-bold text-primary">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Up to 5 campaigns", "AI campaign generation", "Basic analytics", "Email support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-body">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className="w-full btn-press" variant="outline">
                  Start Free Trial
                </Button>
              </Link>
            </Card>

            <Card className="p-8 card-lift border-accent/20 bg-accent/5 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-heading font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-heading font-bold text-accent">$79</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unlimited campaigns", "AI campaign generation", "Advanced analytics", "Priority support", "A/B testing"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="font-body">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className="w-full btn-press bg-accent hover:bg-accent/90 text-accent-foreground">
                  Start Free Trial
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Spark Your Success?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 font-body">
            Join hundreds of businesses already growing with AdSpark AI
          </p>
          <Link to="/auth">
            <Button size="lg" className="btn-press bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 font-heading font-semibold">
              Start Your Free 7-Day Trial
              <Sparkles className="ml-2 w-5 h-5 animate-sparkle" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold">AdSpark AI</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-body">
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Help</a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground font-body">
            © 2025 AdSpark AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
