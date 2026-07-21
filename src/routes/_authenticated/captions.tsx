import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { generateCaption, listCaptions } from "@/lib/captions.functions";
import { Skeleton } from "@/components/ui/skeleton";
import wand3d from "@/assets/3d-ai-wand.png";

export const Route = createFileRoute("/_authenticated/captions")({
  component: CaptionStudio,
  head: () => ({ meta: [{ title: "AI Caption Studio — SocialOS" }] }),
});

const tones = ["friendly", "professional", "marketing", "funny", "formal", "playful"] as const;
const platforms = ["instagram", "linkedin", "twitter", "facebook", "youtube", "threads"] as const;

function CaptionStudio() {
  const generate = useServerFn(generateCaption);
  const list = useServerFn(listCaptions);
  const qc = useQueryClient();

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("friendly");
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("instagram");
  const [copied, setCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterTone, setFilterTone] = useState<string>("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ["captions"],
    queryFn: () => list(),
  });

  const mutation = useMutation({
    mutationFn: () => generate({ data: { topic, audience, tone, platform } }),
    onSuccess: () => {
      toast.success("Caption generated");
      qc.invalidateQueries({ queryKey: ["captions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const result = mutation.data;

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 3) {
      toast.error("Add a topic (at least 3 characters)");
      return;
    }
    mutation.mutate();
  };

  const filteredHistory = (history || []).filter((item) => {
    const matchesSearch =
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.topic && item.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = filterPlatform === "all" || item.platform === filterPlatform;
    const matchesTone = filterTone === "all" || item.tone === filterTone;
    return matchesSearch && matchesPlatform && matchesTone;
  });

  return (
    <div className="space-y-8 relative">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Caption Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Give it a topic. Get platform-perfect copy in seconds.
          </p>
        </div>
        <div className="hidden sm:block w-16 h-16 pointer-events-none select-none animate-float-slow -mt-2">
          <img src={wand3d} alt="3D Wand" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(147,51,234,0.3)]" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Topic
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. Launching our new indoor cycling class this weekend"
                className="mt-1 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Audience (optional)
              </label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                maxLength={200}
                placeholder="e.g. urban millennials interested in fitness"
                className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as typeof platform)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-sm capitalize outline-none focus:border-primary text-foreground"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as typeof tone)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-sm capitalize outline-none focus:border-primary text-foreground"
                >
                  {tones.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
              style={{ background: "var(--gradient-primary)" }}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate caption
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
          {!result && !mutation.isPending && (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-muted-foreground">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm">Your generated caption will appear here.</p>
            </div>
          )}
          {mutation.isPending && (
            <div className="flex h-full min-h-[280px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Caption · {platform}
                </span>
                <button
                  onClick={() => copy(result.caption)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{" "}
                  Copy
                </button>
              </div>
              <p className="whitespace-pre-wrap font-display text-lg leading-relaxed text-foreground">
                {result.caption}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {h.startsWith("#") ? h : `#${h}`}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    CTA
                  </div>
                  <div className="mt-1 text-sm text-foreground">{result.cta}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Virality score
                  </div>
                  <div className="mt-1 font-display text-3xl font-bold text-gradient">
                    {result.score}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 py-4">
                <Skeleton className="h-3.5 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : history && history.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-lg font-semibold">Recent captions</h3>

            {/* Search & Filter Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary w-full sm:w-48 text-foreground"
                />
              </div>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary capitalize text-foreground"
              >
                <option value="all">All platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={filterTone}
                onChange={(e) => setFilterTone(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary capitalize text-foreground"
              >
                <option value="all">All tones</option>
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 divide-y divide-border">
            {filteredHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No captions found matching your search criteria.
              </div>
            ) : (
              filteredHistory.map((c) => (
                <div key={c.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="min-w-0">
                    <div className="text-xs capitalize text-muted-foreground">
                      {c.platform} · {c.tone} · {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-foreground">{c.caption}</div>
                  </div>
                  <button
                    onClick={() => copy(c.caption)}
                    className="justify-self-start rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary sm:justify-self-end cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
