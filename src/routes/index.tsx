import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Calendar,
  BarChart3,
  Wand2,
  Zap,
  Shield,
  Globe2,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
// Static images removed — replaced with animated 3D panels (zero-lag CSS animation)
import heart3d from "@/assets/3d-heart.png";
import calendar3d from "@/assets/3d-calendar.png";
import chart3d from "@/assets/3d-chart.png";
import brain3d from "@/assets/3d-ai-brain.png";
import rocket3d from "@/assets/3d-ai-rocket.png";
import star3d from "@/assets/3d-ai-star.png";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "SocialOS" },
      {
        name: "description",
        content:
          "One dashboard to connect all your social accounts, generate AI captions, schedule posts, and track analytics.",
      },
    ],
  }),
});

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 192 192" fill="currentColor" className={className}>
      <path d="M141.537 88.948c-.773-.03-1.544-.043-2.31-.043-20.732 0-37.247 16.514-37.247 37.247 0 10.37 4.127 19.78 10.793 26.68 6.745 6.99 15.986 10.567 26.454 10.567 10.158 0 19.347-3.415 25.862-9.617 6.47-6.16 9.877-14.774 9.877-24.898 0-26.063-22.18-47.332-47.332-47.332-26.634 0-48.337 21.703-48.337 48.337 0 25.56 20.8 46.36 46.36 46.36 10.297 0 20.218-3.344 28.69-9.673a3.52 3.52 0 0 1 4.296 5.578c-9.786 7.309-21.272 11.238-32.986 11.238-29.42 0-53.4-23.98-53.4-53.491 0-30.566 24.872-55.438 55.438-55.438 29.176 0 54.475 24.086 54.475 52.426 0 12.062-4.08 22.457-11.83 29.835-7.618 7.248-18.232 11.134-29.89 11.134-8.793 0-16.574-3.003-21.92-8.455-5.328-5.434-8.262-12.87-8.262-20.941 0-16.84 13.407-30.247 30.247-30.247 16.527 0 29.882 13.14 30.24 29.356a3.52 3.52 0 1 1-7.037.155c-.266-12.042-10.155-22.37-23.203-22.37-12.96 0-23.208 10.25-23.208 23.208 0 6.643 2.375 12.637 6.688 16.883 4.237 4.167 10.373 6.46 17.29 6.46 9.873 0 18.792-3.327 25.11-9.352 6.304-6.012 9.5-14.49 9.5-23.86 0-24.516-20.862-45.41-45.41-45.41-24.63 0-44.757 20.127-44.757 44.757 0 21.65 17.61 39.26 39.26 39.26 8.528 0 16.634-2.73 23.447-7.9a3.52 3.52 0 0 1 4.267 5.6c-7.904 6.02-17.34 9.34-27.714 9.34-25.525 0-46.3-20.775-46.3-46.3 0-28.513 23.2-51.713 51.713-51.713 28.306 0 51.344 23.038 51.344 51.344 0 25.105-20.375 45.48-45.48 45.48-11.83 0-22.466-4.81-29.957-13.54-7.532-8.77-11.68-20.75-11.68-33.743 0-28.14 22.89-51.03 51.03-51.03 27.234 0 49.387 22.153 49.387 49.387 0 22.39-18.214 40.603-40.603 40.603-8.835 0-17.296-2.905-23.83-8.18a3.52 3.52 0 0 1 4.316-5.56c5.556 4.484 12.658 6.74 20.088 6.74 18.51 0 33.56-15.05 33.56-33.563 0-23.355-19.002-42.357-42.357-42.357-24.26 0-43.991 19.73-43.991 43.99 0 28.59 23.262 51.85 51.85 51.85 24.317 0 44.11-19.793 44.11-44.11v-3.52c0-1.944-1.576-3.52-3.52-3.52z"/>
    </svg>
  );
}

function TiltCard({
  children,
  max = 8,
  className,
  style,
  ...props
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;
    setTilt({
      x: normalizedY * -max,
      y: normalizedX * max,
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${hovered ? 1.025 : 1}, ${hovered ? 1.025 : 1}, 1)`,
        transformStyle: "preserve-3d",
        transition: hovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

const platforms = [
  { name: "Instagram", icon: Instagram, color: "text-pink-600 dark:text-pink-400", desc: "Share photos, reels, and stories." },
  { name: "Facebook", icon: Facebook, color: "text-blue-600 dark:text-blue-400", desc: "Reach pages and community groups." },
  { name: "LinkedIn", icon: Linkedin, color: "text-blue-700 dark:text-blue-500", desc: "Publish professional B2B updates." },
  { name: "X / Twitter", icon: XIcon, color: "text-foreground", desc: "Post short news updates and threads." },
  { name: "YouTube", icon: Youtube, color: "text-red-600 dark:text-red-400", desc: "Upload high-quality video content." },
  { name: "Threads", icon: ThreadsIcon, color: "text-foreground", desc: "Start casual, text-based threads." },
];

const features = [
  {
    icon: Wand2,
    title: "AI Caption Studio",
    desc: "Generate on-brand captions, hashtags, CTAs, and emojis for any platform in seconds.",
  },
  {
    icon: Calendar,
    title: "Unified Scheduling",
    desc: "Plan, queue, and publish posts across every network from one calendar.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Views, reach, engagement, and platform comparisons — updated in real time.",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    desc: "Best posting times, trending hashtags, virality & SEO scores baked in.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "OAuth 2.0, row-level security, audit logs, and role-based access.",
  },
  {
    icon: Globe2,
    title: "Every Platform",
    desc: "Instagram, Facebook, LinkedIn, X, YouTube, Threads — all in one place.",
  },
];

const testimonials = [
  {
    quote:
      "SocialOS replaced four tools for our marketing team. The AI captions alone save us 10 hours a week.",
    author: "Ana Reyes",
    role: "Head of Growth, Northwind",
  },
  {
    quote: "It feels like Linear meets Notion, but for social. Absolutely gorgeous.",
    author: "Marcus Wei",
    role: "Founder, Slate Labs",
  },
  {
    quote: "The analytics view finally makes cross-platform performance make sense.",
    author: "Priya Shah",
    role: "Social Lead, Orbit",
  },
];

const faqs = [
  {
    q: "Is SocialOS free during the beta?",
    a: "Yes. All core features are free while we're in beta. Paid plans launch soon.",
  },
  {
    q: "Which platforms do you support?",
    a: "Instagram, Facebook, LinkedIn, and X today. YouTube and Threads are next.",
  },
  {
    q: "Do you use my content to train AI?",
    a: "Never. Your data stays yours — we only use it to power your own workspace.",
  },
  {
    q: "Can teams collaborate?",
    a: "Team workspaces with role-based access are on the roadmap for Q2.",
  },
];

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

/* ─── Animated slide data ─────────────────────────────────────────── */
const SLIDE_LABELS = [
  "AI Dashboard",
  "Post Scheduler",
  "Platform Hub",
];

/* ─── Slide 1: AI Dashboard ──────────────────────────────────────── */
function SlideAIDashboard() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-5 select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-1.5 w-16 rounded-full bg-white/10 animate-pulse" />
          <div className="h-5 w-5 rounded-full bg-primary/30" />
        </div>
      </div>
      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Reach", val: "124K", color: "from-cyan-500/30 to-blue-600/20" },
          { label: "Posts", val: "48", color: "from-violet-500/30 to-purple-600/20" },
          { label: "Likes", val: "8.2K", color: "from-pink-500/30 to-rose-600/20" },
          { label: "Score", val: "91%", color: "from-emerald-500/30 to-teal-600/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/10 p-2.5`}>
            <div className="text-[9px] text-white/50 uppercase tracking-widest">{s.label}</div>
            <div className="mt-1 text-base font-bold text-white">{s.val}</div>
          </div>
        ))}
      </div>
      {/* Area chart */}
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 overflow-hidden relative">
        <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Virality Trend</div>
        <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,60 C40,50 60,20 100,30 C140,40 160,10 200,15 C240,20 270,35 300,25 L300,80 L0,80Z" fill="url(#gA)" />
          <path d="M0,60 C40,50 60,20 100,30 C140,40 160,10 200,15 C240,20 270,35 300,25" fill="none" stroke="#06b6d4" strokeWidth="2" />
          {/* Animated dot */}
          <circle r="4" fill="#06b6d4" filter="url(#glow)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M0,60 C40,50 60,20 100,30 C140,40 160,10 200,15 C240,20 270,35 300,25" />
          </circle>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
        </svg>
      </div>
      {/* Bottom bar charts */}
      <div className="grid grid-cols-6 gap-1 h-12 items-end">
        {[40, 65, 30, 80, 55, 90].map((h, i) => (
          <div key={i} className="flex items-end justify-center">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-violet-500/60 to-cyan-400/60"
              style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Slide 2: Post Scheduler ─────────────────────────────────────── */
function SlideScheduler() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const events = [
    { day: 0, label: "Instagram Story", color: "from-pink-500/70 to-rose-500/50" },
    { day: 1, label: "LinkedIn Post", color: "from-blue-500/70 to-blue-700/50" },
    { day: 2, label: "Tweet Thread", color: "from-sky-400/70 to-cyan-500/50" },
    { day: 3, label: "YouTube Short", color: "from-red-500/70 to-red-700/50" },
    { day: 4, label: "FB Campaign", color: "from-indigo-500/70 to-purple-600/50" },
    { day: 5, label: "Threads Post", color: "from-emerald-500/70 to-teal-600/50" },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-3 p-5 select-none">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white/80">📅 Content Calendar</div>
        <div className="flex gap-1">
          <div className="h-5 w-12 rounded-full bg-primary/30 text-[8px] flex items-center justify-center text-white/60">July</div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div key={d} className="text-center text-[8px] text-white/30 uppercase tracking-widest pb-1">{d}</div>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <div
            key={i}
            className={`h-7 rounded-md text-[8px] flex items-center justify-center font-medium transition-all ${
              [1, 3, 5, 8, 12, 19].includes(i)
                ? "bg-primary/25 text-primary border border-primary/40"
                : "bg-white/5 text-white/20"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      {/* Event list */}
      <div className="flex flex-col gap-1.5 mt-1 flex-1 overflow-hidden">
        {events.slice(0, 3).map((e, i) => (
          <div key={i} className={`flex items-center gap-2 rounded-lg bg-gradient-to-r ${e.color} px-2.5 py-1.5 border border-white/10`}>
            <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <div className="text-[9px] text-white/90 font-medium">{e.label}</div>
            <div className="ml-auto text-[8px] text-white/40">9:00 AM</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Slide 3: Platform Hub ───────────────────────────────────────── */
function SlidePlatformHub() {
  const hubs = [
    { name: "Instagram", connected: true, posts: 34, color: "#e1306c", icon: "📸" },
    { name: "LinkedIn", connected: true, posts: 18, color: "#0077b5", icon: "💼" },
    { name: "X / Twitter", connected: true, posts: 52, color: "#1da1f2", icon: "𝕏" },
    { name: "YouTube", connected: false, posts: 0, color: "#ff0000", icon: "▶" },
    { name: "Facebook", connected: true, posts: 12, color: "#1877f2", icon: "f" },
    { name: "Threads", connected: false, posts: 0, color: "#000000", icon: "@" },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-3 p-5 select-none">
      <div className="text-xs font-semibold text-white/80">🔗 Connected Platforms</div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {hubs.map((h) => (
          <div
            key={h.name}
            className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3 hover:bg-white/10 transition-colors duration-300"
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: h.color + "33", border: `1px solid ${h.color}55` }}
            >
              {h.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-semibold text-white/80 truncate">{h.name}</div>
              <div className="text-[8px] text-white/40">{h.connected ? `${h.posts} posts` : "Not linked"}</div>
            </div>
            <div className={`h-2 w-2 rounded-full shrink-0 ${h.connected ? "bg-emerald-400" : "bg-white/20"}`} />
          </div>
        ))}
      </div>
      {/* AI badge */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border border-violet-400/20 px-3 py-2 flex items-center gap-2">
        <span className="text-sm">✨</span>
        <div className="text-[9px] text-white/70">AI suggests posting on <span className="text-primary font-semibold">Instagram</span> today at <span className="text-primary font-semibold">7 PM</span></div>
      </div>
    </div>
  );
}

/* ─── Main Slider Shell ───────────────────────────────────────────── */
function ImageSlider() {
  const slides = [
    { component: SlideAIDashboard, label: SLIDE_LABELS[0] },
    { component: SlideScheduler, label: SLIDE_LABELS[1] },
    { component: SlidePlatformHub, label: SLIDE_LABELS[2] },
  ];
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (hovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hovered, slides.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({ x: normalizedY * -8, y: normalizedX * 8 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const SlideComp = slides[current].component;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 shadow-glow transition-all duration-300 ease-out"
      style={{
        background: "linear-gradient(135deg, #0f0c29cc, #302b63cc, #24243ecc)",
        backdropFilter: "blur(24px)",
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${hovered ? 1.025 : 1}, ${hovered ? 1.025 : 1}, 1)`,
        transformStyle: "preserve-3d",
        minHeight: 320,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />

      {/* Scanline effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
        }}
      />

      {/* Slide content — animated fade */}
      <div
        key={current}
        style={{
          animation: "fadeSlideIn 0.5s ease-out forwards",
        }}
      >
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
        `}</style>
        <SlideComp />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur p-2 text-white hover:bg-white/20 transition shadow-elegant cursor-pointer z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur p-2 text-white hover:bg-white/20 transition shadow-elegant cursor-pointer z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Slide label + Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
        <span className="rounded-full bg-white/10 backdrop-blur px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/70">
          {slides[current].label}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                current === idx ? "w-6 bg-primary" : "w-1.5 bg-white/30"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hovered]);

  return (
    <div
      className="relative mx-auto max-w-4xl overflow-hidden px-12 py-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {testimonials.map((t, idx) => (
          <div key={idx} className="w-full shrink-0 px-4">
            <figure className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-elegant text-center relative overflow-hidden">
              <div className="absolute -left-4 -top-8 text-gradient opacity-10 font-display text-[12rem] select-none leading-none">
                “
              </div>
              <blockquote className="text-lg md:text-xl font-medium leading-relaxed italic relative z-10">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex flex-col items-center justify-center">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {t.author[0]}
                </div>
                <div className="mt-2 font-display font-semibold text-foreground">{t.author}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/55 transition cursor-pointer z-10"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % testimonials.length)}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/55 transition cursor-pointer z-10"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              current === idx ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormInputs) => {
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", data);
    toast.success("Thank you! Your message has been sent successfully.");
    reset();
  };

  return (
    <section id="contact" className="border-t border-border bg-surface/50 py-24">
      <div className="mx-auto max-w-xl px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Get in <span className="text-gradient">touch</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Have questions about SocialOS? Drop us a message and we'll get back to you shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Your Name"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition text-foreground"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@company.com"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition text-foreground"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Subject
            </label>
            <input
              type="text"
              {...register("subject")}
              placeholder="How can we help?"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition text-foreground"
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Message
            </label>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Tell us more about your request..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-none text-foreground"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">SocialOS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#platforms" className="transition hover:text-foreground">
              Platforms
            </a>
            <a href="#testimonials" className="transition hover:text-foreground">
              Loved by
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
            <a href="#contact" className="transition hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/auth"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Floating 3D Icons */}
        <div className="absolute left-[5%] top-[15%] hidden xl:block w-36 h-36 pointer-events-none select-none animate-float-slow">
          <img src={heart3d} alt="3D Heart Icon" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(236,72,153,0.35)]" />
        </div>
        <div className="absolute right-[5%] top-[18%] hidden xl:block w-40 h-40 pointer-events-none select-none animate-float-medium">
          <img src={calendar3d} alt="3D Calendar Icon" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(6,182,212,0.35)]" />
        </div>
        <div className="absolute left-[10%] bottom-[12%] hidden xl:block w-32 h-32 pointer-events-none select-none animate-float-fast">
          <img src={chart3d} alt="3D Analytics Icon" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-28 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-elevated/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
              <img src={star3d} alt="3D Star" className="h-4.5 w-4.5 object-contain animate-spin" style={{ animationDuration: "12s" }} />
              Now in beta — free while we're building
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your AI-Powered
              <br />
              <span className="text-gradient">Social Media OS</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Connect every account, generate captions with AI, schedule posts, and monitor
              analytics — all from one premium dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                Start free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-border bg-surface-elevated/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-surface-elevated"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl group/slider">
            {/* Pulsing Blue Background Glow */}
            <div
              className="absolute -inset-10 rounded-full blur-3xl opacity-35 mix-blend-screen pointer-events-none -z-10"
              style={{
                background: "radial-gradient(circle, #00d2ff 0%, #0066ff 60%, transparent 100%)",
                animation: "pulse-glow 5s ease-in-out infinite",
              }}
            />

            {/* Rotating Blue Neon Ring Behind */}
            <div
              className="absolute left-1/2 top-1/2 w-[112%] h-[112%] rounded-full opacity-35 border border-dashed border-cyan-400 pointer-events-none -z-20 mix-blend-screen"
              style={{
                animation: "spin-slow 25s linear infinite",
              }}
            />
            
            {/* Counter-Rotating Blue Neon Ring Behind */}
            <div
              className="absolute left-1/2 top-1/2 w-[105%] h-[105%] rounded-full opacity-20 border border-cyan-500/50 pointer-events-none -z-20 mix-blend-screen"
              style={{
                animation: "spin-reverse 18s linear infinite",
              }}
            />

            {/* Moving Neon Light Beams (top & bottom border tracks) */}
            <div className="absolute inset-x-8 -top-1 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none blur-[1px] animate-pulse" />
            <div className="absolute inset-x-8 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80 pointer-events-none blur-[1px] animate-pulse" />

            <ImageSlider />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="border-y border-border bg-surface py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Publish everywhere
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {platforms.map((p) => (
              <TiltCard
                key={p.name}
                max={6}
                className="flex flex-col items-center text-center gap-3 rounded-2xl border border-border bg-card p-5 text-sm font-semibold hover:shadow-elegant transition cursor-pointer"
              >
                <p.icon className={`h-6 w-6 ${p.color}`} />
                <div>
                  <div className="text-foreground font-bold">{p.name}</div>
                  <div className="mt-1.5 text-xs font-normal text-muted-foreground leading-normal">{p.desc}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need. <span className="text-gradient">Nothing you don't.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              A complete operating system for modern social teams — thoughtfully designed,
              obsessively fast.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <TiltCard
                key={f.title}
                max={5}
                className="group relative rounded-2xl border border-border bg-card p-6 cursor-pointer hover:shadow-elegant transition-shadow duration-300"
              >
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            {/* Floating 3D AI Brain illustration */}
            <div className="absolute -left-14 -top-14 w-24 h-24 pointer-events-none select-none animate-float-medium opacity-70">
              <img src={brain3d} alt="3D AI Brain" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.25)]" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur relative z-10">
              <Sparkles className="h-3 w-3 text-accent" /> AI Studio
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Captions that <span className="text-gradient">actually convert.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Give it a topic and an audience. Get platform-tailored copy, smart hashtags, and a
              call-to-action in seconds. Rewrite, shorten, or remix with one click.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Tone controls: professional, friendly, marketing, playful",
                "Multiple variations at once",
                "Virality & SEO scoring",
                "Trending hashtag suggestions",
                "One-click smart Call-to-Action suggestions",
                "Multi-language translation in 30+ styles",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <TiltCard max={8} className="glass rounded-2xl p-6 shadow-elegant cursor-pointer">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" /> Generated caption · Instagram
            </div>
            <p className="font-display text-lg leading-relaxed">
              "Monday resets hit different when your coffee's cold and your ambition's not ☕⚡ Drop
              the excuse — pick the win. What's one thing you're locking in this week?"
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["#MondayMotivation", "#FoundersJourney", "#RiseAndGrind", "#SmallBiz"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              {[
                { l: "Virality", v: "92" },
                { l: "SEO", v: "88" },
                { l: "Readability", v: "A+" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-gradient">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Loved by modern teams
            </h2>
          </div>
          <TestimonialsSlider />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-surface py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Questions? <span className="text-gradient">Answered.</span>
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <div className="flex items-center justify-between gap-4">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                  </div>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl border border-border p-12 text-center shadow-glow group/cta cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            {/* Floating 3D Rocket */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block w-32 h-32 pointer-events-none select-none animate-float-slow transition-all duration-500 group-hover/cta:scale-110 group-hover/cta:rotate-6">
              <img src={rocket3d} alt="3D Rocket Launch" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(244,63,94,0.45)]" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Your social workflow, reinvented.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join the beta and get everything free while we build the future of social media
              management.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:opacity-90"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="grid h-6 w-6 place-items-center rounded-md text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-display font-semibold text-foreground">SocialOS</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#contact" className="transition hover:text-foreground">
              Contact
            </a>
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
