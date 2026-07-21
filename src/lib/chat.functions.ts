import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageInput = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatInput = z.object({
  messages: z.array(MessageInput),
});

export const askChatbot = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => ChatInput.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      // Fallback response if AI is not configured to avoid error screens
      return { 
        reply: "Hello! I am the SocialOS Assistant. AI features are currently running in demo mode. Let me know if you need help connecting platforms, generating captions, or using the scheduler!" 
      };
    }

    const systemPrompt = `You are a helpful, professional, and witty AI assistant for SocialOS. 
SocialOS is a premium all-in-one Social Media Operating System. 
Features of SocialOS include:
1. AI Caption Studio: Generate platform-perfect captions, hashtags, and CTAs.
2. Unified Scheduling: Compose posts and schedule them across Instagram, Facebook, LinkedIn, X, and YouTube.
3. Deep Analytics: Monitor reach, engagement, and platform performance.
4. Platforms: Secure OAuth2 connection for multiple social profiles.

Keep your answers relatively short, professional, and action-oriented. Feel free to use tasteful emojis.`;

    try {
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
            ...data.messages,
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { reply: "I am receiving too many requests right now. Please try again in a moment! ⚡" };
        if (res.status === 402) return { reply: "AI credits are exhausted. Please add credits to your workspace." };
        throw new Error(`AI request failed (${res.status})`);
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't process that.";
      return { reply };
    } catch (e: any) {
      console.error("Chatbot API error:", e);
      return { reply: "I encountered a brief connection error. Let me know how else I can assist you with your social media management!" };
    }
  });
