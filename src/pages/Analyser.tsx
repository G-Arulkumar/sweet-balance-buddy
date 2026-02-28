import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FoodAnalysis {
  food_name: string;
  calories: number;
  carbs_g: number;
  sugar_g: number;
  fiber_g: number;
  protein_g: number;
  fat_g: number;
  glycemic_index: number | string;
  is_safe: boolean;
  risk_level: string;
  warning: string;
  recommendation: string;
  alternatives: string[];
}

const Analyser = () => {
  const { profile } = useProfile();
  const [foodName, setFoodName] = useState("");
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyse = async (name?: string, imageBase64?: string) => {
    if (!name && !imageBase64) return;
    setLoading(true);
    setAnalysis(null);

    const { data, error } = await supabase.functions.invoke("analyze-food", {
      body: { foodName: name, imageBase64, userProfile: profile },
    });

    if (error) {
      toast.error("Failed to analyse food");
    } else if (data?.error) {
      toast.error(data.error);
    } else {
      setAnalysis(data);
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      analyse(undefined, base64);
    };
    reader.readAsDataURL(file);
  };

  const riskColor = (level: string) => {
    if (level === "low") return "bg-success text-success-foreground";
    if (level === "medium") return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold">Food Analyser</h1>
        <p className="mt-1 text-muted-foreground">Type a food name or upload a photo to get diabetes-safe nutrition analysis.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Search by Name</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); analyse(foodName); }} className="flex gap-2">
                  <Input
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. White rice, Apple, Pizza..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !foodName.trim()}>
                    <Search className="mr-2 h-4 w-4" /> Analyse
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Upload Food Image</CardTitle></CardHeader>
              <CardContent>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <Button
                  variant="outline"
                  className="w-full border-dashed py-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {loading ? "Analysing..." : "Click to upload food photo"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Analysing food...</span>
                </CardContent>
              </Card>
            )}

            {analysis && !loading && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-xl">{analysis.food_name}</CardTitle>
                    <Badge className={riskColor(analysis.risk_level)}>
                      {analysis.risk_level} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Safety */}
                  <div className={`flex items-start gap-3 rounded-lg p-4 ${analysis.is_safe ? "bg-success/10" : "bg-destructive/10"}`}>
                    {analysis.is_safe ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold">{analysis.is_safe ? "Safe for you ✅" : "Caution ⚠️"}</p>
                      <p className="text-sm text-muted-foreground">{analysis.warning || analysis.recommendation}</p>
                    </div>
                  </div>

                  {/* Nutrition Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Calories", value: analysis.calories, unit: "kcal" },
                      { label: "Carbs", value: analysis.carbs_g, unit: "g" },
                      { label: "Sugar", value: analysis.sugar_g, unit: "g" },
                      { label: "Fiber", value: analysis.fiber_g, unit: "g" },
                      { label: "Protein", value: analysis.protein_g, unit: "g" },
                      { label: "GI", value: analysis.glycemic_index, unit: "" },
                    ].map((n) => (
                      <div key={n.label} className="rounded-lg bg-muted p-3 text-center">
                        <p className="text-lg font-bold">{n.value}{n.unit}</p>
                        <p className="text-xs text-muted-foreground">{n.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  {analysis.recommendation && (
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-sm font-medium">💡 {analysis.recommendation}</p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {analysis.alternatives?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold">Healthier Alternatives:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.alternatives.map((alt) => (
                          <Badge key={alt} variant="secondary" className="cursor-pointer" onClick={() => { setFoodName(alt); analyse(alt); }}>
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!analysis && !loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Search className="mb-4 h-12 w-12 text-primary/20" />
                  <p className="font-display text-lg font-semibold">No food analysed yet</p>
                  <p className="mt-1 text-sm">Search by name or upload a photo to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analyser;
