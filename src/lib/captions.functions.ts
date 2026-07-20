import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GenerateInput = z.object({
  topic: z.string().trim().min(3).max(500),
  audience: z.string().trim().max(200).optional().default(""),
  tone: z
    .enum(["professional", "friendly", "marketing", "funny", "formal", "playful"])
    .default("friendly"),
  platform: z
    .enum(["instagram", "facebook", "linkedin", "twitter", "youtube", "threads"])
    .default("instagram"),
});

const CaptionResult = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  cta: z.string(),
  score: z.number().int().min(0).max(100),
});

export const generateCaption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => GenerateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please contact support.");

    const systemPrompt = `You are an elite social media copywriter for ${data.platform}. Return ONLY valid JSON matching: {"caption": string, "hashtags": string[6-10], "cta": string, "score": integer 0-100 virality estimate}. Use tone: ${data.tone}. Include tasteful emojis where appropriate. Optimize length for ${data.platform}.`;

    const userPrompt = `Topic: ${data.topic}\nAudience: ${data.audience || "general"}\nGenerate the caption now.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limited. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(`AI request failed (${res.status})`);
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    const parsed = CaptionResult.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("AI returned an unexpected response. Try again.");

    const { error } = await context.supabase.from("captions").insert({
      user_id: context.userId,
      topic: data.topic,
      audience: data.audience || null,
      tone: data.tone,
      platform: data.platform,
      caption: parsed.data.caption,
      hashtags: parsed.data.hashtags,
      cta: parsed.data.cta,
      score: parsed.data.score,
    });
    if (error) console.error("Failed to persist caption:", error);

    return parsed.data;
  });

export const listCaptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("captions")
      .select("id, topic, tone, platform, caption, hashtags, cta, score, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
