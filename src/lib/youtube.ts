import { supabase } from "@/integrations/supabase/client";
import { createYouTubeResumableSessionServerFn } from "./youtube.functions";

export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
}

// Function to extract provider_token from window location hash or session or localStorage
export function getYouTubeProviderToken(): string | null {
  if (typeof window !== "undefined") {
    // 1. Try parsing hash params if present
    const hash = window.location.hash;
    if (hash && hash.includes("provider_token=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const tokenFromHash = params.get("provider_token");
      if (tokenFromHash) {
        localStorage.setItem("youtube_provider_token", tokenFromHash);
        return tokenFromHash;
      }
    }
  }

  // 2. Check localStorage
  const stored = localStorage.getItem("youtube_provider_token");
  if (stored) return stored;

  return null;
}

export async function uploadVideoToYouTube(
  file: File,
  title: string,
  description: string,
  onProgress?: (percent: number) => void,
): Promise<YouTubeUploadResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("You must be logged in to upload to YouTube.");
  }

  // Get token from session, URL hash, or localStorage
  let token = session.provider_token || getYouTubeProviderToken();
  if (session.provider_token) {
    localStorage.setItem("youtube_provider_token", session.provider_token);
  }

  if (!token) {
    throw new Error("YOUTUBE_AUTH_REQUIRED");
  }

  const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

  // 1. Create Resumable Upload Session via server function with Origin header
  const { uploadUrl } = await createYouTubeResumableSessionServerFn({
    data: {
      title,
      description,
      mimeType: file.type || "video/mp4",
      fileSize: file.size,
      providerToken: token,
      origin: clientOrigin,
    },
  });

  // 2. Stream binary file directly from browser to Google's CORS-enabled upload URL using XHR for progress tracking
  return new Promise<YouTubeUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          const videoId = json.id;
          resolve({
            videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          });
        } catch (e: any) {
          reject(new Error("Failed to parse YouTube response"));
        }
      } else {
        if (xhr.status === 401 || xhr.status === 403) {
          localStorage.removeItem("youtube_provider_token");
          reject(new Error("YOUTUBE_AUTH_REQUIRED"));
          return;
        }
        let msg = `YouTube direct upload failed (HTTP ${xhr.status})`;
        try {
          const errJson = JSON.parse(xhr.responseText);
          if (errJson?.error?.message) msg = errJson.error.message;
        } catch (_) {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during YouTube video upload."));
    };

    xhr.send(file);
  });
}

export async function authorizeYouTubePermissions() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("youtube_provider_token");
  }

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes:
        "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: window.location.origin + "/publisher",
    },
  });
}
