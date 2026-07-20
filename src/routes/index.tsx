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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";
import schedulerImg from "@/assets/slide-scheduler.png";
import platformsImg from "@/assets/slide-platforms.png";
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

const platforms = ["Instagram", "Facebook", "LinkedIn", "X / Twitter", "YouTube", "Threads"];

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

function ImageSlider() {
  const slides = [
    { src: heroImg, alt: "SocialOS dashboard preview - Overview" },
    { src: schedulerImg, alt: "SocialOS dashboard preview - Post Scheduler" },
    { src: platformsImg, alt: "SocialOS dashboard preview - Connected Platforms" },
  ];
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hovered, slides.length]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border shadow-glow bg-surface"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="w-full shrink-0">
            <img
              src={slide.src}
              alt={slide.alt}
              width={1600}
              height={1200}
              className="w-full object-cover animate-fade-in"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-surface-elevated/80 p-2 text-foreground backdrop-blur hover:bg-surface-elevated transition shadow-elegant cursor-pointer z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-surface-elevated/80 p-2 text-foreground backdrop-blur hover:bg-surface-elevated transition shadow-elegant cursor-pointer z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              current === idx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
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
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-accent" />
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

          <div className="relative mx-auto mt-16 max-w-5xl">
            <div
              className="absolute inset-x-8 -top-6 h-24 blur-3xl"
              style={{ background: "var(--gradient-primary)", opacity: 0.4 }}
            />
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
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {platforms.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
              >
                {p}
              </div>
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
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
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
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
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
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elegant">
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
          </div>
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
            className="relative overflow-hidden rounded-3xl border border-border p-12 text-center shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
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
