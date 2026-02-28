import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Droplets, Moon, Dumbbell, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Prediction {
  glucose_trend: string;
  risk_assessment: string;
  predicted_range: { min: number; max: number };
  daily_routine: {
    morning: { time: string; activities: string[]; meal_suggestion: string };
    afternoon: { time: string; activities: string[]; meal_suggestion: string };
    evening: { time: string; activities: string[]; meal_suggestion: string };
  };
  exercise_recommendations: { type: string; duration_min: number; benefit: string }[];
  hydration_goal_liters: number;
  sleep_recommendation_hours: number;
  warnings: string[];
  motivational_tip: string;
}

const trendIcon = (trend: string) => {
  if (trend === "rising") return "📈";
  if (trend === "falling") return "📉";
  return "➡️";
};

const riskColor = (level: string) => {
  if (level === "low") return "bg-success text-success-foreground";
  if (level === "moderate") return "bg-warning text-warning-foreground";
  return "bg-destructive text-destructive-foreground";
};

const Predictor = () => {
  const { profile } = useProfile();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("predict-health", {
      body: { userProfile: profile, recentMeals: [], glucoseReadings: [] },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Failed to generate prediction");
    } else {
      setPrediction(data);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Health Predictor</h1>
            <p className="mt-1 text-muted-foreground">AI-powered glucose predictions and personalized daily routines.</p>
          </div>
          <Button onClick={predict} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {prediction ? "Refresh" : "Generate Prediction"}
          </Button>
        </div>

        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 font-display text-lg">Analysing your health data...</p>
          </div>
        )}

        {!prediction && !loading && (
          <Card className="mt-16">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <TrendingUp className="mb-4 h-12 w-12 text-primary/20" />
              <p className="font-display text-lg font-semibold">No prediction yet</p>
              <p className="mt-1 text-sm">Click "Generate Prediction" for personalized health insights.</p>
            </CardContent>
          </Card>
        )}

        {prediction && !loading && (
          <div className="mt-8 space-y-6">
            {/* Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl">{trendIcon(prediction.glucose_trend)}</p>
                  <p className="mt-2 font-semibold capitalize">{prediction.glucose_trend}</p>
                  <p className="text-sm text-muted-foreground">Glucose Trend</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Badge className={`text-base ${riskColor(prediction.risk_assessment)}`}>
                    {prediction.risk_assessment}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">Risk Assessment</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Droplets className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-1 text-xl font-bold">{prediction.hydration_goal_liters}L</p>
                  <p className="text-sm text-muted-foreground">Hydration Goal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Moon className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-1 text-xl font-bold">{prediction.sleep_recommendation_hours}h</p>
                  <p className="text-sm text-muted-foreground">Sleep Goal</p>
                </CardContent>
              </Card>
            </div>

            {/* Warnings */}
            {prediction.warnings?.length > 0 && (
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span className="font-semibold">Warnings</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {prediction.warnings.map((w, i) => (
                      <li key={i}>⚠️ {w}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Daily Routine */}
            <Card>
              <CardHeader><CardTitle className="font-display">🗓️ Daily Routine</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {(["morning", "afternoon", "evening"] as const).map((period) => {
                    const r = prediction.daily_routine?.[period];
                    if (!r) return null;
                    return (
                      <div key={period} className="rounded-lg bg-muted p-4">
                        <p className="font-display font-semibold capitalize">{period === "morning" ? "🌅" : period === "afternoon" ? "☀️" : "🌙"} {period}</p>
                        <p className="text-xs text-muted-foreground">{r.time}</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {r.activities?.map((a, i) => <li key={i}>• {a}</li>)}
                        </ul>
                        <p className="mt-3 rounded bg-primary/5 p-2 text-sm">🍽️ {r.meal_suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Exercise */}
            <Card>
              <CardHeader><CardTitle className="font-display">🏃 Exercise Plan</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {prediction.exercise_recommendations?.map((ex, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-muted p-4">
                      <Dumbbell className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{ex.type}</p>
                        <p className="text-sm text-muted-foreground">{ex.duration_min} min — {ex.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motivational */}
            {prediction.motivational_tip && (
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-6 text-center">
                  <p className="font-display text-lg font-semibold">💪 {prediction.motivational_tip}</p>
                </CardContent>
              </Card>
            )}

            <p className="text-center text-xs text-muted-foreground">
              ⚠️ This is AI-generated advice. Always consult your healthcare provider before making changes.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Predictor;
