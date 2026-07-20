import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LayoutDashboard, Wand2, LogOut, Link2, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/publisher", label: "Publisher", icon: Send },
  { to: "/captions", label: "AI Captions", icon: Wand2 },
  { to: "/platforms", label: "Platforms", icon: Link2 },
] as const;

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold">SocialOS</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user.email}</div>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-md text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-display font-bold">SocialOS</span>
        </Link>
        <div className="flex items-center gap-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm ${pathname.startsWith(n.to) ? "text-foreground" : "text-muted-foreground"}`}
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
          <button onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
