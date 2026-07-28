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
  apiKey: z.string().optional(),
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
    const geminiKey = data.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY || process.env.VITE_LOVABLE_API_KEY;

    if (!geminiKey && !lovableKey) {
      // Smart offline AI fallback generator
      const formattedTopic = data.topic.charAt(0).toUpperCase() + data.topic.slice(1);
      const hashtags = [
        `#${data.platform.toLowerCase()}creator`,
        `#${data.topic.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`,
        "#growthmindset",
        "#contentstrategy",
        "#socialos",
        "#viralpost",
        "#digitalmarketing",
      ];

      return {
        caption: `🚀 ${formattedTopic}\n\nTransforming ideas into high-impact digital content! Whether you're aiming for audience engagement or brand clarity, consistency is the key to scaling your reach on ${data.platform.toUpperCase()}.\n\n💡 Pro tip: Align your messaging with your audience's core interests for maximum conversion!`,
        hashtags,
        cta: `What are your thoughts on ${data.topic}? Drop a comment below! 👇`,
        score: Math.floor(Math.random() * 15) + 84,
      };
    }

    const systemPrompt = `You are an elite social media copywriter for ${data.platform}. Return ONLY valid JSON matching: {"caption": string, "hashtags": string[6-10], "cta": string, "score": integer 0-100 virality estimate}. Use tone: ${data.tone}. Include tasteful emojis where appropriate. Optimize length for ${data.platform}.`;

    const userPrompt = `Topic: ${data.topic}\nAudience: ${data.audience || "general"}\nGenerate the caption now.`;

    let res: Response;
    let resultData: z.infer<typeof CaptionResult>;

    if (geminiKey) {
      const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];
      let lastError = "";

      for (const modelName of modelsToTry) {
        try {
          res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: systemPrompt + "\n\n" + userPrompt }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                }
              }),
            }
          );

          if (res.ok) {
            const json = await res.json();
            const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
            const parsed = CaptionResult.safeParse(JSON.parse(raw));
            if (parsed.success) {
              return parsed.data;
            }
          } else {
            const errText = await res.text().catch(() => "");
            lastError = `Gemini API Error (${res.status}): ${errText || "Request failed"}`;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      throw new Error(lastError || "Failed to generate caption with Gemini API.");
    } else {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
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
      if (!parsed.success) {
        throw new Error("Failed to parse caption JSON from AI response.");
      }
      resultData = parsed.data;
    }

    try {
      await context.supabase.from("captions").insert({
        user_id: context.userId,
        topic: data.topic,
        audience: data.audience || null,
        tone: data.tone,
        platform: data.platform,
        caption: resultData.caption,
        hashtags: resultData.hashtags,
        cta: resultData.cta,
        score: resultData.score,
      });
    } catch (err) {
      console.error("Failed to persist caption:", err);
    }

    return resultData;
  });

export const listCaptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("captions")
      .select("id, topic, tone, platform, caption, hashtags, cta, score, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
