import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userProfile, recentMeals, glucoseReadings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a diabetes health predictor and daily routine advisor. Based on the user's profile and recent data, provide personalized predictions and recommendations.

Return a JSON response with this exact structure:
{
  "glucose_trend": "rising" | "stable" | "falling",
  "risk_assessment": "low" | "moderate" | "high",
  "predicted_range": { "min": number, "max": number },
  "daily_routine": {
    "morning": { "time": "string", "activities": ["list"], "meal_suggestion": "string" },
    "afternoon": { "time": "string", "activities": ["list"], "meal_suggestion": "string" },
    "evening": { "time": "string", "activities": ["list"], "meal_suggestion": "string" }
  },
  "exercise_recommendations": [{ "type": "string", "duration_min": number, "benefit": "string" }],
  "hydration_goal_liters": number,
  "sleep_recommendation_hours": number,
  "warnings": ["any immediate concerns"],
  "motivational_tip": "encouraging message"
}

User Profile:
- Age: ${userProfile?.age || 'unknown'}
- Weight: ${userProfile?.weight || 'unknown'} kg
- Diabetes Type: ${userProfile?.diabetes_type || 'Type 2'}
- Daily Carb Limit: ${userProfile?.daily_carb_limit || 150}g
- Recent Glucose: ${userProfile?.recent_glucose_level || 'unknown'} mg/dL

Recent meals: ${JSON.stringify(recentMeals || [])}
Recent glucose readings: ${JSON.stringify(glucoseReadings || [])}

Always encourage consulting a doctor. Never diagnose.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my daily health prediction and routine recommendations based on my profile." },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Predict error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let prediction;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse prediction" };
    } catch {
      prediction = { raw_response: content, error: "Could not parse structured response" };
    }

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
