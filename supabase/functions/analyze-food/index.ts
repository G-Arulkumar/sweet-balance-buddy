import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { foodName, imageBase64, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a diabetes-focused food nutrition analyzer. Analyze the food provided and return a JSON response with this exact structure:
{
  "food_name": "name of the food",
  "calories": number,
  "carbs_g": number,
  "sugar_g": number,
  "fiber_g": number,
  "protein_g": number,
  "fat_g": number,
  "glycemic_index": number or "unknown",
  "is_safe": boolean,
  "risk_level": "low" | "medium" | "high",
  "warning": "warning message if unsafe, empty string if safe",
  "recommendation": "portion control advice or healthier alternative",
  "alternatives": ["list", "of", "healthier", "alternatives"]
}

User's daily carb limit: ${userProfile?.daily_carb_limit || 150}g
User's diabetes type: ${userProfile?.diabetes_type || 'Type 2'}
User's recent glucose: ${userProfile?.recent_glucose_level || 'unknown'} mg/dL

Rules:
- If carbs exceed 40% of their daily limit in one serving → mark as unsafe
- If glycemic index > 70 → mark risk as high
- Always suggest portion sizes
- Provide 2-3 healthier alternatives`;

    const userContent: any[] = [];
    if (foodName) {
      userContent.push({ type: "text", text: `Analyze this food for diabetes safety: ${foodName}` });
    }
    if (imageBase64) {
      userContent.push({ type: "text", text: "Analyze this food image for diabetes safety." });
      userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } });
    }

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
          { role: "user", content: userContent },
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
      console.error("Analyze error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse analysis" };
    } catch {
      analysis = { raw_response: content, error: "Could not parse structured response" };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
