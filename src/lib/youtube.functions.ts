import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ResumableSessionInput = z.object({
  title: z.string().min(1).max(100),
  description: z.string().default(""),
  mimeType: z.string().default("video/mp4"),
  fileSize: z.number(),
  providerToken: z.string().optional(),
  origin: z.string().optional(),
});

export const createYouTubeResumableSessionServerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => ResumableSessionInput.parse(raw))
  .handler(async ({ data }) => {
    const token = data.providerToken;
    if (!token) {
      throw new Error("YOUTUBE_AUTH_REQUIRED");
    }

    const metadata = {
      snippet: {
        title: data.title.slice(0, 95) || "Uploaded via SocialOS",
        description: data.description || "Uploaded via SocialOS Creator Studio",
        tags: ["SocialOS", "Shorts", "Video"],
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(data.fileSize),
      "X-Upload-Content-Type": data.mimeType,
    };

    // Critical for Google CORS when browser PUTs directly to uploadUrl
    if (data.origin) {
      headers["Origin"] = data.origin;
      headers["X-Goog-Upload-Origin"] = data.origin;
    }

    const res = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      },
    );

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const msg = errorJson?.error?.message || `Google API Error (${res.status})`;
      console.error("Google YouTube Upload Session Error Response:", res.status, errorJson);

      const isScopeError =
        msg.toLowerCase().includes("scope") ||
        msg.toLowerCase().includes("auth") ||
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("insufficient");

      if (res.status === 401 || res.status === 403 || isScopeError) {
        throw new Error("YOUTUBE_AUTH_REQUIRED");
      }

      throw new Error(`Google API Error (${res.status}): ${msg}`);
    }

    const uploadUrl = res.headers.get("location");
    if (!uploadUrl) {
      throw new Error("Google YouTube API failed to return resumable upload session location.");
    }

    return { uploadUrl };
  });
