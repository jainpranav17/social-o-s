import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Wand2,
  Calendar,
  Upload,
  Link2,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Users,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";
import target3d from "@/assets/3d-ai-target.png";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SocialOS" }] }),
});

function Dashboard() {
  // Fetch current user details
  const { data: user, isLoading: loadingUser } = useQuery({
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

  // Fetch user profile from Supabase
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      if (error) return null;
      return data;
    },
  });

  const userEmail = user?.email || "";
  const emailPrefix = userEmail.split("@")[0] || "User";
  const rawName = profile?.display_name || emailPrefix;
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const displayName = rawName.split(/[\._-]/).map(capitalize).join(" ");

  // 1. Fetch total captions count
  const { data: totalCaptions = 0, isLoading: loadingTotal } = useQuery({
    queryKey: ["captions-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("captions")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // 2. Fetch platform distribution
  const { data: platformData = [], isLoading: loadingPlatform } = useQuery({
    queryKey: ["captions-platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("captions").select("platform");
      if (error) throw error;

      const counts = (data || []).reduce((acc: Record<string, number>, curr) => {
        const rawPlatform = curr.platform || "other";
        const p = rawPlatform.charAt(0).toUpperCase() + rawPlatform.slice(1);
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});

      const defaultPlatforms = [
        "Instagram",
        "LinkedIn",
        "Twitter",
        "Facebook",
        "Youtube",
        "Threads",
      ];

      // If no data, return defaults with 0
      if (Object.keys(counts).length === 0) {
        return defaultPlatforms.map((name) => ({ name, posts: 0 }));
      }

      return Object.entries(counts).map(([name, posts]) => ({ name, posts }));
    },
  });

  // 3. Fetch average virality score
  const { data: avgScore = 0, isLoading: loadingScore } = useQuery({
    queryKey: ["captions-avg-score"],
    queryFn: async () => {
      const { data, error } = await supabase.from("captions").select("score");
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      const sum = data.reduce((acc, curr) => acc + (curr.score || 0), 0);
      return Math.round(sum / data.length);
    },
  });

  // 4. Fetch connected platforms count dynamically based on the connection mode (always real OAuth now)
  const { data: connectedCount = 0 } = useQuery({
    queryKey: ["connected-platforms-count"],
    queryFn: async () => {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();
      if (error || !currentUser) return 0;
      const disabled = JSON.parse(localStorage.getItem("disabled_real_platforms") || "[]");
      const identities = currentUser.identities || [];
      const platformToProviderMap: Record<string, string> = {
        instagram: "instagram",
        facebook: "facebook",
        youtube: "google",
        linkedin: "linkedin_oidc",
        twitter: "twitter",
      };
      const activeProviders = Object.entries(platformToProviderMap)
        .filter(([platformId]) => !disabled.includes(platformId))
        .map(([, provider]) => provider);
      return identities.filter((id) => activeProviders.includes(id.provider)).length;
    },
  });

  // 5. Fetch posts history count for scheduled & published stats
  const { data: postsStats = { scheduled: 0, published: 0 } } = useQuery({
    queryKey: ["posts-history-stats"],
    queryFn: async () => {
      const saved = localStorage.getItem("social_os_posts");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as any[];
          const scheduled = parsed.filter((p) => p.status === "scheduled").length;
          const published = parsed.filter((p) => p.status === "published").length;
          return { scheduled, published };
        } catch {
          return { scheduled: 0, published: 0 };
        }
      }
      return { scheduled: 0, published: 0 };
    },
  });

  // 6. Fetch recent captions for timeline
  const { data: growthData = [] } = useQuery({
    queryKey: ["captions-growth-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captions")
        .select("created_at, score")
        .order("created_at", { ascending: true });
      if (error) throw error;

      if (!data || data.length === 0) {
        return [
          { day: "Mon", score: 0 },
          { day: "Tue", score: 0 },
          { day: "Wed", score: 0 },
          { day: "Thu", score: 0 },
          { day: "Fri", score: 0 },
          { day: "Sat", score: 0 },
          { day: "Sun", score: 0 },
        ];
      }

      return data.map((item) => {
        const date = new Date(item.created_at);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        return {
          day,
          score: item.score || 0,
        };
      });
    },
  });

  const topStats = [
    {
      label: "AI Captions",
      value: loadingTotal ? "..." : String(totalCaptions),
      sub: "generated in studio",
      icon: Wand2,
    },
    {
      label: "Average Virality",
      value: loadingScore ? "..." : `${avgScore}%`,
      sub: "gemini estimation",
      icon: TrendingUp,
    },
    {
      label: "Connected accounts",
      value: String(connectedCount),
      sub: "of 5 connected",
      icon: Link2,
    },
    {
      label: "Scheduled posts",
      value: String(postsStats.scheduled),
      sub: "next 7 days",
      icon: Calendar,
    },
  ];

  const analytics = [
    {
      label: "AI Generations",
      value: loadingTotal ? "..." : String(totalCaptions),
      delta: "Real-time",
      icon: Eye,
    },
    {
      label: "Avg Virality",
      value: loadingScore ? "..." : `${avgScore}%`,
      delta: "Gemini",
      icon: Heart,
    },
    {
      label: "Published Posts",
      value: String(postsStats.published),
      delta: "Publisher",
      icon: Send,
    },
    {
      label: "Reach Estimate",
      value: totalCaptions > 0 ? `${(totalCaptions * 1.5).toFixed(1)}K` : "0",
      delta: "Estimated",
      icon: Users,
    },
  ];

  const isLoading = loadingTotal || loadingPlatform || loadingScore || loadingUser;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between relative">
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Here's what's happening across your channels.
            </p>
          </div>
          <div className="hidden sm:block w-14 h-14 pointer-events-none select-none animate-float-slow">
            <img src={target3d} alt="3D Target" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.3)]" />
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/publisher"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-foreground border border-border bg-card transition hover:bg-secondary"
          >
            <Upload className="h-4 w-4 text-primary" /> Upload & Publish
          </Link>
          <Link
            to="/captions"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-4 w-4" /> Generate caption
          </Link>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analytics.map((a) => (
          <div key={a.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <a.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{a.label}</span>
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{a.value}</div>
            <div className="mt-1 text-xs font-medium text-accent">{a.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Weekly Growth</h3>
              <p className="text-xs text-muted-foreground">
                Estimated virality of your generated captions
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.56 0.22 264)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.56 0.22 264)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260 / 0.5)" />
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.56 0.22 264)"
                  fill="url(#v)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">By platform</h3>
          <p className="text-xs text-muted-foreground">Generated captions per platform</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260 / 0.5)" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="posts" fill="oklch(0.68 0.2 264)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Generate caption", icon: Wand2, to: "/captions" as const },
            { label: "Upload reel / video", icon: Upload, to: "/publisher" as const },
            { label: "Schedule post", icon: Calendar, to: "/publisher" as const },
            { label: "Connect platform", icon: Link2, to: "/platforms" as const },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-4 transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div
                className="group-hover:scale-105 transition grid h-9 w-9 place-items-center rounded-lg text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <a.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
