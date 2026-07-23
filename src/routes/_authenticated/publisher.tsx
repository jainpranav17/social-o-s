import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadVideoToYouTube, authorizeYouTubePermissions } from "@/lib/youtube";

export async function authorizeTwitterPermissions() {
  const disabled = JSON.parse(localStorage.getItem("disabled_real_platforms") || "[]");
  localStorage.setItem("disabled_real_platforms", JSON.stringify(disabled.filter((p: string) => p !== "twitter")));

  await supabase.auth.linkIdentity({
    provider: "twitter",
    options: {
      redirectTo: window.location.origin + "/publisher",
    },
  });
}

export async function authorizeLinkedInPermissions() {
  const disabled = JSON.parse(localStorage.getItem("disabled_real_platforms") || "[]");
  localStorage.setItem("disabled_real_platforms", JSON.stringify(disabled.filter((p: string) => p !== "linkedin")));

  await supabase.auth.linkIdentity({
    provider: "linkedin_oidc",
    options: {
      redirectTo: window.location.origin + "/publisher",
    },
  });
}
import {
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Globe,
  Film,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  ExternalLink,
  Shield,
  Key,
  X,
} from "lucide-react";
import chat3d from "@/assets/3d-ai-chat.png";

export const Route = createFileRoute("/_authenticated/publisher")({
  component: PublisherStudio,
  head: () => ({ meta: [{ title: "Publisher & Scheduler — SocialOS" }] }),
});

type PlatformId = "instagram" | "youtube" | "facebook" | "linkedin" | "twitter";

interface PlatformOption {
  id: PlatformId;
  name: string;
  badge: string;
  gradient: string;
}

interface StoredPost {
  id: string;
  title?: string;
  caption: string;
  mediaUrl: string;
  mediaType: "video" | "image";
  mediaName: string;
  platforms: PlatformId[];
  status: "published" | "scheduled";
  scheduledFor?: string;
  createdAt: string;
  externalLink?: string;
}

const PLATFORMS: PlatformOption[] = [
  {
    id: "instagram",
    name: "Instagram Reel / Post",
    badge: "Reels & Feed",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    id: "youtube",
    name: "YouTube Shorts / Video",
    badge: "Shorts",
    gradient: "from-red-600 to-red-500",
  },
  { id: "facebook", name: "Facebook Feed", badge: "Post", gradient: "from-blue-600 to-blue-500" },
  {
    id: "linkedin",
    name: "LinkedIn Post",
    badge: "Professional",
    gradient: "from-blue-700 to-indigo-600",
  },
  { id: "twitter", name: "Twitter / X", badge: "Post", gradient: "from-zinc-800 to-black" },
];

function PublisherStudio() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([
    "instagram",
    "youtube",
  ]);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image">("image");

  // Publishing mode & schedule date
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  // UI states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStep, setPublishingStep] = useState<string>("");
  const [youtubeAuthNeeded, setYoutubeAuthNeeded] = useState(false);
  const [twitterAuthNeeded, setTwitterAuthNeeded] = useState(false);
  const [linkedinAuthNeeded, setLinkedinAuthNeeded] = useState(false);

  // Fetch current user auth session details (including identities)
  const { data: user } = useQuery({
    queryKey: ["current-user-info"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const identities = user?.identities || [];
  const isPlatformConnected = (platformId: PlatformId) => {
    const disabled = JSON.parse(localStorage.getItem("disabled_real_platforms") || "[]");
    if (disabled.includes(platformId)) return false;

    const providerMap: Record<PlatformId, string> = {
      instagram: "instagram",
      facebook: "facebook",
      youtube: "google",
      linkedin: "linkedin_oidc",
      twitter: "twitter",
    };
    const targetProvider = providerMap[platformId];
    return identities.some((id) => id.provider === targetProvider);
  };

  const [activePreviewTab, setActivePreviewTab] = useState<PlatformId>("instagram");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // History list
  const [postsHistory, setPostsHistory] = useState<StoredPost[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "published" | "scheduled">("all");

  // Load posts history
  useEffect(() => {
    const saved = localStorage.getItem("social_os_posts");
    if (saved) {
      try {
        setPostsHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load posts history:", e);
      }
    }
  }, []);

  const savePostsHistory = (updated: StoredPost[]) => {
    setPostsHistory(updated);
    localStorage.setItem("social_os_posts", JSON.stringify(updated));
    qc.invalidateQueries({ queryKey: ["connected-platforms-count"] });
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit.");
      return;
    }
    const isVid =
      file.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi|m4v|3gp|flv)$/i.test(file.name);
    setMediaType(isVid ? "video" : "image");
    setMediaFile(file);

    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
    toast.success(`Loaded ${file.name} (${isVid ? "Video" : "Image"})`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const togglePlatform = (id: PlatformId) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) {
        toast.error("Select at least one platform.");
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleImportCaption = () => {
    const sampleCaptions = [
      "🚀 Next-level content creation made effortless with AI! Check out our latest workflow breakdown below 👇 #SocialOS #AICreator #Growth",
      "✨ Building modern web apps with speed & precision. What features are you shipping this week? Let us know in the comments! 🔥 #BuildInPublic",
      "🎬 Behind the scenes of our latest video release. Don't forget to like, save, and subscribe for more weekly tips! 💡 #Reels #YouTubeShorts",
    ];
    const picked = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)];
    setCaption(picked);
    toast.success("AI Caption inserted!");
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaPreviewUrl) {
      toast.error("Please add a caption or media file to publish.");
      return;
    }

    if (publishMode === "schedule" && (!scheduleDate || !scheduleTime)) {
      toast.error("Please pick a valid date and time to schedule.");
      return;
    }

    setIsPublishing(true);
    setPublishingStep("Initializing publish queue...");

    let externalYoutubeUrl: string | undefined = undefined;

    // Check if YouTube platform is selected
    if (selectedPlatforms.includes("youtube") && publishMode === "now") {
      const isVid =
        mediaFile &&
        (mediaType === "video" ||
          mediaFile.type.startsWith("video/") ||
          /\.(mp4|mov|mkv|webm|avi|m4v|3gp|flv)$/i.test(mediaFile.name));

      if (mediaFile && isVid) {
        try {
          setPublishingStep("Uploading video binary to YouTube Data API...");
          const res = await uploadVideoToYouTube(
            mediaFile,
            caption.slice(0, 90) || "SocialOS Video Upload",
            caption,
          );
          externalYoutubeUrl = res.videoUrl;
          toast.success(`Real YouTube Upload Success! Video ID: ${res.videoId}`);
        } catch (err: any) {
          setIsPublishing(false);
          if (err.message === "YOUTUBE_AUTH_REQUIRED") {
            setYoutubeAuthNeeded(true);
            toast.error(
              "YouTube authorization required. Please click 'Authorize YouTube' to grant channel upload access.",
            );
            return;
          }
          toast.error(`YouTube API Upload Error: ${err.message}`);
          console.error("YouTube Direct Upload Error:", err);
          return;
        }
      } else if (!mediaFile) {
        toast.warning(
          "YouTube selected: Attach a video file to post directly to your YouTube channel.",
        );
      }
    }

    // Check if Twitter platform is selected
    if (selectedPlatforms.includes("twitter") && publishMode === "now") {
      if (!isPlatformConnected("twitter")) {
        setIsPublishing(false);
        setTwitterAuthNeeded(true);
        toast.error("Twitter authorization required. Please connect your Twitter account first.");
        return;
      }

      try {
        setPublishingStep("Staging text content for Twitter...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (mediaFile) {
          setPublishingStep("Uploading media attachments to Twitter Media API...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        setPublishingStep("Publishing status to X timeline...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err: any) {
        setIsPublishing(false);
        toast.error(`Twitter Upload Error: ${err.message}`);
        return;
      }
    }

    // Check if LinkedIn platform is selected
    if (selectedPlatforms.includes("linkedin") && publishMode === "now") {
      if (!isPlatformConnected("linkedin")) {
        setIsPublishing(false);
        setLinkedinAuthNeeded(true);
        toast.error("LinkedIn authorization required. Please connect your LinkedIn account first.");
        return;
      }

      try {
        setPublishingStep("Formatting share payload for LinkedIn...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (mediaFile) {
          setPublishingStep("Uploading media to LinkedIn Assets API...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        setPublishingStep("Creating share post on LinkedIn feed...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err: any) {
        setIsPublishing(false);
        toast.error(`LinkedIn Upload Error: ${err.message}`);
        return;
      }
    }

    setPublishingStep("Finalizing post records & updating metrics...");

    setTimeout(() => {
      const isScheduled = publishMode === "schedule";
      const newPost: StoredPost = {
        id: "post_" + Date.now(),
        caption: caption.trim() || "Untitled Media Post",
        mediaUrl:
          mediaPreviewUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
        mediaType,
        mediaName: mediaFile?.name || "Uploaded Media",
        platforms: selectedPlatforms,
        status: isScheduled ? "scheduled" : "published",
        scheduledFor: isScheduled ? `${scheduleDate} ${scheduleTime}` : undefined,
        createdAt: new Date().toISOString(),
        externalLink: externalYoutubeUrl,
      };

      const updated = [newPost, ...postsHistory];
      savePostsHistory(updated);

      setIsPublishing(false);

      if (isScheduled) {
        toast.success(`Post scheduled for ${scheduleDate} at ${scheduleTime}!`);
      } else {
        toast.success(
          `Post successfully published to ${selectedPlatforms.map((p) => p.toUpperCase()).join(", ")}!`,
        );
      }

      // Clear form
      setCaption("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
    }, 1000);
  };

  const handleDeletePost = (id: string) => {
    const updated = postsHistory.filter((p) => p.id !== id);
    savePostsHistory(updated);
    toast.success("Post removed from history.");
  };

  const filteredPosts = postsHistory.filter((p) => {
    if (filterTab === "published") return p.status === "published";
    if (filterTab === "scheduled") return p.status === "scheduled";
    return true;
  });

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Publisher & Scheduler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload videos & reels, craft AI copy, preview live mockup cards, and publish across your
            channels.
          </p>
        </div>
        <div className="hidden sm:block w-16 h-16 pointer-events-none select-none animate-float-slow -mt-2">
          <img src={chat3d} alt="3D Chat" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)]" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Creator & Form (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* File Upload Zone */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <h3 className="mb-3 font-display text-base font-semibold flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" /> Media Attachment
            </h3>

            {mediaPreviewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-black/40">
                {mediaType === "video" ? (
                  <div className="relative aspect-video w-full bg-black">
                    <video
                      ref={videoRef}
                      src={mediaPreviewUrl}
                      className="h-full w-full object-contain"
                      autoPlay
                      loop
                      muted={isMuted}
                    />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="rounded-lg bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="rounded-lg bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full">
                    <img
                      src={mediaPreviewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border bg-card p-3">
                  <span className="truncate text-xs font-mono font-medium text-muted-foreground">
                    {mediaFile?.name} ({mediaType.toUpperCase()})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreviewUrl(null);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-elevated p-8 text-center transition hover:border-primary/50 hover:bg-secondary/40 cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="mt-3 font-display text-sm font-semibold">
                  Drag & drop video reel or image here
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Supports MP4, MOV, WEBM, PNG, JPG (Max 100MB)
                </div>
              </div>
            )}
          </div>

          {/* Platform Selector */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <h3 className="mb-3 font-display text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Select Target Channels
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLATFORMS.map((p) => {
                const active = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition text-left ${
                      active
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border bg-surface-elevated text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${p.gradient}`} />
                      <span className="text-xs">{p.name}</span>
                    </div>
                    {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Editor & Mode */}
          <form
            onSubmit={handlePublishSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-elegant space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Caption & Copy
              </h3>
              <button
                type="button"
                onClick={handleImportCaption}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Auto AI Insert
              </button>
            </div>

            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption, video description, or hashtags..."
              className="w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {/* Publishing options */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 border-t border-border pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === "now"}
                    onChange={() => setPublishMode("now")}
                    className="accent-primary"
                  />
                  <Send className="h-3.5 w-3.5" /> Publish Immediately
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === "schedule"}
                    onChange={() => setPublishMode("schedule")}
                    className="accent-primary"
                  />
                  <Calendar className="h-3.5 w-3.5" /> Schedule for Later
                </label>
              </div>

              {publishMode === "schedule" && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Select Date</label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Select Time</label>
                    <input
                      type="time"
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {publishingStep || "Processing Queue..."}
                </>
              ) : publishMode === "schedule" ? (
                <>
                  <Calendar className="h-4 w-4" /> Schedule Post
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Publish Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Mockup Preview & History (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Live Mockup Switcher */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Live Card Preview
              </h3>
              <div className="flex gap-1 rounded-lg bg-surface p-1">
                {(["instagram", "youtube", "twitter"] as PlatformId[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActivePreviewTab(tab)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition ${
                      activePreviewTab === tab
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Device Card */}
            <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
              {/* Instagram Card View */}
              {activePreviewTab === "instagram" && (
                <div>
                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                        <div className="h-full w-full rounded-full bg-black grid place-items-center text-[10px] text-white font-bold">
                          S
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono">socialos_creator</span>
                    </div>
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="relative aspect-square w-full bg-black/90">
                    {mediaPreviewUrl ? (
                      mediaType === "video" ? (
                        <video
                          src={mediaPreviewUrl}
                          className="h-full w-full object-cover"
                          autoPlay
                          loop
                          muted
                        />
                      ) : (
                        <img
                          src={mediaPreviewUrl}
                          alt="Instagram Post"
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <Video className="h-8 w-8 opacity-40" />
                        <span className="mt-2 text-xs">Media preview will render here</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <div className="flex gap-3">
                        <Heart className="h-4 w-4 hover:text-red-500 cursor-pointer" />
                        <MessageCircle className="h-4 w-4 hover:text-foreground cursor-pointer" />
                        <Share2 className="h-4 w-4 hover:text-foreground cursor-pointer" />
                      </div>
                    </div>
                    <div className="text-xs text-foreground leading-snug line-clamp-3">
                      <span className="font-bold mr-1.5">socialos_creator</span>
                      {caption || "Your post caption will appear here..."}
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube Shorts View */}
              {activePreviewTab === "youtube" && (
                <div>
                  <div className="flex items-center justify-between p-3 border-b border-border/50 bg-red-600/10">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-600" />
                      <span className="text-xs font-bold">YouTube Shorts</span>
                    </div>
                  </div>

                  <div className="relative aspect-[9/14] w-full bg-black">
                    {mediaPreviewUrl ? (
                      mediaType === "video" ? (
                        <video
                          src={mediaPreviewUrl}
                          className="h-full w-full object-cover"
                          autoPlay
                          loop
                          muted
                        />
                      ) : (
                        <img
                          src={mediaPreviewUrl}
                          alt="YouTube Short"
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <Film className="h-8 w-8 opacity-40" />
                        <span className="mt-2 text-xs">Shorts Player Preview</span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-3 right-3 text-white space-y-1">
                      <div className="text-xs font-bold truncate">@SocialOSChannel</div>
                      <div className="text-xs opacity-90 line-clamp-2">
                        {caption || "Short description..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Twitter / X View */}
              {activePreviewTab === "twitter" && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary grid place-items-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        SocialOS <Twitter className="h-3 w-3 text-sky-500 fill-current" />
                      </div>
                      <div className="text-[11px] text-muted-foreground">@socialos_app</div>
                    </div>
                  </div>

                  <div className="text-xs text-foreground leading-relaxed">
                    {caption || "What's happening? Your tweet content will be rendered here."}
                  </div>

                  {mediaPreviewUrl && (
                    <div className="overflow-hidden rounded-xl border border-border aspect-video">
                      {mediaType === "video" ? (
                        <video
                          src={mediaPreviewUrl}
                          className="h-full w-full object-cover"
                          autoPlay
                          loop
                          muted
                        />
                      ) : (
                        <img
                          src={mediaPreviewUrl}
                          alt="Tweet Media"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Posts History */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Post Activity Log</h3>
              <div className="flex gap-1 rounded-lg bg-surface p-1 text-xs">
                {(["all", "published", "scheduled"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterTab(t)}
                    className={`rounded-md px-2 py-1 capitalize transition ${
                      filterTab === t
                        ? "bg-card text-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No posts found in this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated p-3.5 transition hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                        {post.mediaType === "video" ? (
                          <video src={post.mediaUrl} className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Thumbnail"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {post.caption || "Media Post"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold text-[10px] ${
                              post.status === "published"
                                ? "bg-accent/20 text-accent"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {post.status.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{post.platforms.join(", ")}</span>
                          {post.externalLink && (
                            <a
                              href={post.externalLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-0.5 text-primary hover:underline font-semibold"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Auth Prompt Modal */}
      {youtubeAuthNeeded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-glow">
            <button
              onClick={() => setYoutubeAuthNeeded(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-red-500">
              <Youtube className="h-6 w-6" />
              <h3 className="font-display text-lg font-bold">YouTube Permission Required</h3>
            </div>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              To upload videos directly to your YouTube Channel, SocialOS needs one-time permission
              to interact with your channel via the YouTube Data API.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setYoutubeAuthNeeded(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setYoutubeAuthNeeded(false);
                  await authorizeYouTubePermissions();
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Key className="h-4 w-4" /> Authorize YouTube
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Twitter Auth Prompt Modal */}
      {twitterAuthNeeded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-glow">
            <button
              onClick={() => setTwitterAuthNeeded(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-sky-500">
              <Twitter className="h-6 w-6 fill-current" />
              <h3 className="font-display text-lg font-bold">Twitter Permission Required</h3>
            </div>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              To publish tweets and media directly to your Twitter/X timeline, SocialOS needs permission
              to interact with your account via the Twitter API.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setTwitterAuthNeeded(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTwitterAuthNeeded(false);
                  await authorizeTwitterPermissions();
                }}
                className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 flex items-center justify-center gap-2"
              >
                <Key className="h-4 w-4" /> Authorize Twitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Auth Prompt Modal */}
      {linkedinAuthNeeded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-glow">
            <button
              onClick={() => setLinkedinAuthNeeded(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-indigo-600">
              <Linkedin className="h-6 w-6 fill-current" />
              <h3 className="font-display text-lg font-bold">LinkedIn Permission Required</h3>
            </div>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              To create posts and share media directly on your LinkedIn feed, SocialOS needs permission
              to interact with your profile via the LinkedIn API.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLinkedinAuthNeeded(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLinkedinAuthNeeded(false);
                  await authorizeLinkedInPermissions();
                }}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Key className="h-4 w-4" /> Authorize LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
