import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, MessageCircle, Search, TrendingUp, Heart, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Health Chatbot",
    desc: "Get instant, personalized diabetes advice from our AI assistant trained on medical guidelines.",
  },
  {
    icon: Search,
    title: "Food Analyser",
    desc: "Upload food images or type food names to get detailed nutritional analysis with diabetes safety ratings.",
  },
  {
    icon: TrendingUp,
    title: "Health Predictor",
    desc: "AI-powered glucose trend predictions and personalized daily routine recommendations.",
  },
  {
    icon: Shield,
    title: "Evidence-Based",
    desc: "All advice follows medical guidelines. We always encourage consulting your doctor.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">GlucoGuide</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" />
              Your Diabetes Health Companion
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Take Control of Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Diabetes Health
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              AI-powered food analysis, personalized chatbot advice, and health predictions — 
              all tailored to your unique diabetes profile.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">
            Everything You Need to Manage Diabetes
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="border-0 bg-card shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="font-display text-3xl font-bold">Ready to Get Started?</h2>
              <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
                Join GlucoGuide today and take the first step toward smarter diabetes management.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="mt-8 gap-2 px-8">
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>⚠️ GlucoGuide provides informational support only. Always consult your healthcare provider for medical decisions.</p>
          <p className="mt-2">© 2026 GlucoGuide. Built with ❤️ for better health.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
