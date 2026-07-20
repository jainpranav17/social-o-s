import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Check,
  Trash2,
  X,
  Shield,
  Key,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/platforms")({
  component: PlatformsPage,
  head: () => ({ meta: [{ title: "Connected Platforms — SocialOS" }] }),
});

type PlatformId = "instagram" | "facebook" | "youtube" | "twitter" | "linkedin";

interface PlatformInfo {
  id: PlatformId;
  name: string;
  color: string;
  bgGradient: string;
  iconSvg: React.ReactNode;
}

interface ConnectionData {
  username: string;
  connectedAt: string;
}

type ConnectionsMap = Record<string, ConnectionData>;

const PLATFORMS: PlatformInfo[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#E1306C",
    bgGradient:
      "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    bgGradient: "linear-gradient(135deg, #1877F2 0%, #0056b3 100%)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    bgGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    name: "Twitter / X",
    color: "#1DA1F2",
    bgGradient: "linear-gradient(135deg, #15202B 0%, #000000 100%)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    bgGradient: "linear-gradient(135deg, #FF0000 0%, #b30000 100%)",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// Mapping of verified email addresses to their real social platform accounts
const EMAIL_ACCOUNTS_MAP: Record<string, Record<PlatformId, string>> = {
  "jainpranav1707@gmail.com": {
    instagram: "@jainpranav17",
    facebook: "Pranav Jain",
    linkedin: "linkedin.com/in/jainpranav17",
    twitter: "@jainpranav17",
    youtube: "Pranav Jain",
  },
  "test@example.com": {
    instagram: "@testuser",
    facebook: "Test User",
    linkedin: "linkedin.com/in/testuser",
    twitter: "@testuser",
    youtube: "Test Channel",
  },
};

function PlatformsPage() {
  const qc = useQueryClient();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [disabledRealPlatforms, setDisabledRealPlatforms] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<PlatformInfo | null>(null);
  const [linkingState, setLinkingState] = useState<"idle" | "authorizing" | "fetching" | "saving">(
    "idle",
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRealMode, setIsRealMode] = useState<boolean>(false);

  // Fetch current user auth session details (including identities)
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

  const userEmail = user?.email || "";
  const platformAccounts = EMAIL_ACCOUNTS_MAP[userEmail];
  const detectedHandle = activeModal ? platformAccounts?.[activeModal.id] : undefined;

  // Retrieve linked identities from Supabase
  const identities = user?.identities || [];
  const getRealConnection = (platformId: PlatformId) => {
    if (disabledRealPlatforms.includes(platformId)) return undefined;
    const providerMap: Record<PlatformId, string> = {
      instagram: "instagram",
      facebook: "facebook",
      youtube: "google",
      linkedin: "linkedin_oidc",
      twitter: "twitter",
    };
    const targetProvider = providerMap[platformId];
    return identities.find((id) => id.provider === targetProvider);
  };

  // Load existing connections and user choice for Mode & Disabled Real Platforms
  useEffect(() => {
    const saved = localStorage.getItem("connected_platforms");
    if (saved) {
      try {
        setConnections(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading connections:", e);
      }
    }
    const savedDisabled = localStorage.getItem("disabled_real_platforms");
    if (savedDisabled) {
      try {
        setDisabledRealPlatforms(JSON.parse(savedDisabled));
      } catch (e) {
        console.error("Error loading disabled real platforms:", e);
      }
    }
    const savedMode = localStorage.getItem("connection_mode");
    if (savedMode) {
      setIsRealMode(savedMode === "real");
    }
  }, []);

  const toggleConnectionMode = () => {
    const nextMode = !isRealMode;
    setIsRealMode(nextMode);
    localStorage.setItem("connection_mode", nextMode ? "real" : "demo");
    qc.invalidateQueries({ queryKey: ["connected-platforms-count"] });
  };

  const saveConnections = (updated: ConnectionsMap) => {
    setConnections(updated);
    localStorage.setItem("connected_platforms", JSON.stringify(updated));
    qc.invalidateQueries({ queryKey: ["connected-platforms-count"] });
  };

  const saveDisabledRealPlatforms = (updated: string[]) => {
    setDisabledRealPlatforms(updated);
    localStorage.setItem("disabled_real_platforms", JSON.stringify(updated));
    qc.invalidateQueries({ queryKey: ["connected-platforms-count"] });
  };

  const handleOpenConnect = (platform: PlatformInfo) => {
    if (isRealMode) {
      // If it was locally disabled, re-enable it
      if (disabledRealPlatforms.includes(platform.id)) {
        saveDisabledRealPlatforms(disabledRealPlatforms.filter((p) => p !== platform.id));
        toast.success(`Re-connected ${platform.name}!`);
        return;
      }
      handleRealConnect(platform);
    } else {
      setActiveModal(platform);
      setLinkingState("idle");
      setConnectionError(null);
    }
  };

  // Real Supabase Identity Linkage
  const handleRealConnect = async (platform: PlatformInfo) => {
    const providerMap: Record<PlatformId, string> = {
      instagram: "instagram",
      facebook: "facebook",
      youtube: "google",
      linkedin: "linkedin_oidc",
      twitter: "twitter",
    };

    const provider = providerMap[platform.id];
    const options: any = {
      redirectTo: window.location.origin + "/platforms",
    };

    if (platform.id === "youtube") {
      options.scopes = "https://www.googleapis.com/auth/youtube.readonly";
    }

    try {
      toast.loading(`Redirecting to ${platform.name} secure authentication...`);
      const { error } = await supabase.auth.linkIdentity({
        provider: provider as any,
        options,
      });
      if (error) throw error;
    } catch (e: any) {
      toast.dismiss();
      toast.error(
        `Linkage failed: ${e.message}. Ensure this provider is enabled in your Supabase Auth dashboard.`,
      );
      console.error(e);
    }
  };

  const handleDisconnect = async (platformId: PlatformId) => {
    if (isRealMode) {
      const realConn = getRealConnection(platformId);
      if (realConn) {
        try {
          toast.loading(`Disconnecting platform...`);
          const { error } = await supabase.auth.unlinkIdentity(realConn);
          if (error) {
            // Handle primary identity unlinking restriction gracefully
            if (error.message.includes("at least 1 identity")) {
              saveDisabledRealPlatforms([...disabledRealPlatforms, platformId]);
              toast.dismiss();
              toast.success(`Disconnected ${platformId.toUpperCase()} from workspace.`);
              return;
            }
            throw error;
          }
          toast.dismiss();
          toast.success(`Unlinked identity successfully.`);
          qc.invalidateQueries({ queryKey: ["current-user-info"] });
          qc.invalidateQueries({ queryKey: ["connected-platforms-count"] });
        } catch (e: any) {
          toast.dismiss();
          // Fallback to workspace disconnect if Supabase blocks primary identity removal
          saveDisabledRealPlatforms([...disabledRealPlatforms, platformId]);
          toast.success(`Disconnected ${platformId.toUpperCase()} from workspace.`);
        }
      } else {
        saveDisabledRealPlatforms([...disabledRealPlatforms, platformId]);
        toast.success(`Disconnected ${platformId.toUpperCase()} from workspace.`);
      }
    } else {
      const updated = { ...connections };
      delete updated[platformId];
      saveConnections(updated);
      toast.success(`Disconnected from ${platformId.toUpperCase()}`);
    }
  };

  // Mock Handshake Flow (Demo Mode)
  const handleConfirmConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    setConnectionError(null);
    setLinkingState("authorizing");

    setTimeout(() => {
      setLinkingState("fetching");

      setTimeout(() => {
        if (!detectedHandle) {
          setLinkingState("idle");
          setConnectionError(
            `Verification Failed: No registered ${activeModal.name} profile found under the active Google session ${userEmail}.`,
          );
          toast.error(`No account found for ${userEmail}`);
          return;
        }

        setLinkingState("saving");

        setTimeout(() => {
          const updated = {
            ...connections,
            [activeModal.id]: {
              username: detectedHandle,
              connectedAt: new Date().toISOString(),
            },
          };
          saveConnections(updated);
          toast.success(`Successfully connected to ${activeModal.name}!`);
          setActiveModal(null);
          setLinkingState("idle");
        }, 600);
      }, 1000);
    }, 800);
  };

  if (loadingUser) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Connected Platforms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your social media channels. Connected platforms enable scheduling and analytics.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-semibold shadow-elegant">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Mode:</span>
          <button
            onClick={toggleConnectionMode}
            className="flex items-center gap-1.5 transition hover:opacity-90"
            title="Toggle between demo simulation and real Supabase OAuth connection"
          >
            <span className={isRealMode ? "text-muted-foreground" : "text-primary"}>Demo Mode</span>
            {isRealMode ? (
              <ToggleRight className="h-5 w-5 text-accent" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={isRealMode ? "text-primary" : "text-muted-foreground"}>
              Real OAuth
            </span>
          </button>
        </div>
      </div>

      {/* Helper Banner for Real Mode */}
      {isRealMode && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex gap-3 text-sm leading-relaxed">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Real OAuth Mode Active.</span> Real OAuth connects platforms
            by redirecting you to their official sign-in screen via Supabase. YouTube works
            immediately. For Instagram, Facebook, Twitter, and LinkedIn, make sure you have enabled
            their providers in your **Supabase Dashboard &gt; Authentication &gt; Providers**!
          </div>
        </div>
      )}

      {/* Cards list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          let isConnected = false;
          let username = "";
          let linkedAt = "";

          if (isRealMode) {
            const realConn = getRealConnection(platform.id);
            isConnected = !!realConn;
            username =
              realConn?.identity_data?.name ||
              realConn?.identity_data?.full_name ||
              realConn?.identity_data?.email ||
              "Authorized Account";
            linkedAt = realConn?.created_at
              ? new Date(realConn.created_at).toLocaleDateString()
              : new Date().toLocaleDateString();
          } else {
            isConnected = !!connections[platform.id];
            username = connections[platform.id]?.username || "";
            linkedAt = connections[platform.id]?.connectedAt
              ? new Date(connections[platform.id].connectedAt).toLocaleDateString()
              : "";
          }

          return (
            <div
              key={platform.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-elegant"
            >
              {/* Header Banner */}
              <div
                className="flex items-center justify-between p-6 text-white"
                style={{ background: platform.bgGradient }}
              >
                <div className="flex items-center gap-3">
                  {platform.iconSvg}
                  <span className="font-display text-lg font-bold">{platform.name}</span>
                </div>
                {isConnected ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <Check className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    Inactive
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="mb-6 space-y-2">
                  <h4 className="text-sm font-semibold">
                    {isConnected ? "Linked Account" : "Access Credentials"}
                  </h4>
                  {isConnected ? (
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-semibold text-foreground truncate max-w-full">
                        {username}
                      </div>
                      <div className="text-xs text-muted-foreground">Linked on {linkedAt}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Connect your {platform.name} profile to schedule automated posts, retrieve
                      analytics, and optimize performance.
                    </p>
                  )}
                </div>

                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" /> Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenConnect(platform)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4" /> Connect Account
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect modal (Demo Mode only) */}
      {!isRealMode && activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-glow">
            <button
              onClick={() => linkingState === "idle" && setActiveModal(null)}
              disabled={linkingState !== "idle"}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Secure OAuth Connection</h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              SocialOS will query the platform directory for an account linked to your device's
              session.
            </p>

            <form onSubmit={handleConfirmConnect} className="mt-6 space-y-4">
              {connectionError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 flex gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Account Verification Failed</div>
                    <div className="mt-1 text-xs opacity-90">{connectionError}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ACTIVE BROWSER SESSION</span>
                    <span className="flex items-center gap-1 text-accent font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Scanning
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                      {userEmail[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-mono text-foreground truncate max-w-[240px]">
                        {userEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Looking up associated {activeModal.name} account...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {linkingState !== "idle" ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="font-display text-xs font-semibold text-muted-foreground text-center">
                    {linkingState === "authorizing" &&
                      `Opening secure handshake with ${activeModal.name}...`}
                    {linkingState === "fetching" &&
                      `Checking registry for active accounts under ${userEmail}...`}
                    {linkingState === "saving" && "Registering account access token..."}
                  </span>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  {connectionError ? (
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                    >
                      Close
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        <Key className="h-4 w-4" /> Link Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
