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
      const lastUserMsg = [...data.messages].reverse().find(m => m.role === "user")?.content.toLowerCase() || "";

      if (lastUserMsg.includes("schedule") || lastUserMsg.includes("calendar") || lastUserMsg.includes("queue")) {
        return {
          reply: "📅 **How to Schedule Posts:**\n1. Go to the **Publisher & Scheduler** page from the sidebar.\n2. Select the platforms you want to publish to.\n3. Write your caption and upload your media (image or video).\n4. Change the toggle to **Schedule**.\n5. Select your date and time, and click **Schedule Post**!"
        };
      }
      
      if (lastUserMsg.includes("caption") || lastUserMsg.includes("ai studio") || lastUserMsg.includes("generate")) {
        return {
          reply: "✍️ **How to Generate Captions:**\n1. Go to the **AI Caption Studio** from the sidebar.\n2. Describe your topic and target audience.\n3. Select your platform and choose a tone (e.g. professional, playful, marketing).\n4. Click **Generate**! SocialOS will generate the copy, hashtags, CTAs, and a virality score."
        };
      }

      if (lastUserMsg.includes("platform") || lastUserMsg.includes("connect") || lastUserMsg.includes("instagram") || lastUserMsg.includes("facebook") || lastUserMsg.includes("linkedin") || lastUserMsg.includes("youtube") || lastUserMsg.includes("twitter") || lastUserMsg.includes("threads")) {
        return {
          reply: "🔌 **Supported Platforms:**\nSocialOS connects to **Instagram**, **Facebook**, **LinkedIn**, **Twitter/X**, **YouTube**, and **Threads**.\n\nTo link a platform:\n1. Click **Connected Platforms** in the sidebar.\n2. Select either **Sandbox Mode** (for simulation) or **Real Mode**.\n3. Click the respective platform card to link your account."
        };
      }

      if (lastUserMsg.includes("analytic") || lastUserMsg.includes("view") || lastUserMsg.includes("metric") || lastUserMsg.includes("reach") || lastUserMsg.includes("score")) {
        return {
          reply: "📈 **Understanding Analytics:**\nGo to the **Dashboard** home page to view:\n• **AI Captions**: Total copy items generated.\n• **Average Virality**: Predicted success score calculated by Gemini.\n• **Connected accounts**: Number of active platform links.\n• **Engagement charts**: Weekly timeline metrics."
        };
      }

      if (lastUserMsg.includes("hi") || lastUserMsg.includes("hello") || lastUserMsg.includes("hey")) {
        return {
          reply: "Hello! 👋 I am the SocialOS assistant. Ask me anything about how to connect platforms, schedule posts, generate AI captions, or track dashboard analytics!"
        };
      }

      if (lastUserMsg.includes("thank") || lastUserMsg.includes("thanks")) {
        return {
          reply: "You're welcome! Let me know if there's anything else I can do to help you streamline your social media workflow. 🚀"
        };
      }

      return {
        reply: "I am the SocialOS AI Assistant. Ask me a question about:\n• 📅 **Scheduling** posts\n• ✍️ Generating **captions**\n• 🔌 Connecting **platforms**\n• 📈 Viewing **analytics**\n\n*(Note: AI Gateway API Key is not configured in your .env file, so I'm assisting you in offline guide mode!)*"
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
