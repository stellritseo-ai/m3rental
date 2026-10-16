import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Check,
  User,
  Truck,
  Phone,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Tag,
  ChevronRight,
  Sparkles,
  Bookmark,
  Printer,
  Copy,
  CheckCircle2,
  ListFilter,
  ThumbsUp,
  MessageSquare,
  Building2,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getBlogPostBySlugDb } from "@/lib/api/blog.functions";
import type { BlogPostDoc } from "@/lib/blog-shared";
import { site } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await getBlogPostBySlugDb({
        data: { slug: params.slug, incrementViews: true },
      });
      return {
        post: (res?.post || null) as BlogPostDoc | null,
        relatedPosts: (res?.relatedPosts || []) as BlogPostDoc[],
      };
    } catch (err) {
      console.error("Failed to load article:", err);
      return { post: null, relatedPosts: [] };
    }
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Article Not Found | M3 Rental Houston" }],
      };
    }
    return {
      meta: [
        {
          title: `${post.title} | M3 Commercial Equipment Houston`,
        },
        {
          name: "description",
          content: post.excerpt,
        },
        {
          property: "og:title",
          content: `${post.title} — M3 Rental Houston`,
        },
        {
          property: "og:description",
          content: post.excerpt,
        },
        {
          property: "og:image",
          content: post.coverImage,
        },
        {
          property: "og:type",
          content: "article",
        },
      ],
    };
  },
  component: BlogPostDetailPage,
});

function formatDate(iso: string): string {
  if (!iso) return "Recently";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");
}

// Recommended fleet machinery displayed in the sidebar & bottom conversion bar
const FEATURED_MACHINERY = [
  {
    name: "CAT 320 Hydraulic Excavator",
    category: "Heavy Equipment",
    rate: "$750 / day",
    specs: "22-Ton Operating Weight • 22 ft Dig Depth",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f156d?auto=format&fit=crop&w=800&q=80",
    slug: "cat-320-hydraulic-excavator",
  },
  {
    name: "50-Ton Rough Terrain Crane",
    category: "Heavy Cranes",
    rate: "$1,450 / day",
    specs: "115 ft Boom • 4-Wheel Steer Crab",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
    slug: "50-ton-rough-terrain-crane",
  },
];

function BlogPostDetailPage() {
  const { post, relatedPosts } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"helpful" | "feedback" | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  // Scroll Progress & Sticky Nav listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setShowStickyNav(totalScroll > 420);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parse Table of Contents from markdown headings
  const tocItems = useMemo<TocItem[]>(() => {
    if (!post?.content) return [];
    const lines = post.content.split("\n");
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        const text = trimmed.replace(/^##\s+/, "");
        items.push({ id: slugifyHeading(text), text, level: 2 });
      } else if (trimmed.startsWith("### ")) {
        const text = trimmed.replace(/^###\s+/, "");
        items.push({ id: slugifyHeading(text), text, level: 3 });
      }
    });

    return items;
  }, [post?.content]);

  if (!post) {
    return (
      <SiteLayout>
        <div className="py-24 text-center container-x max-w-2xl">
          <div className="size-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-6">
            <ArrowLeft className="size-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Article Not Found</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            The article you are trying to view might have been moved, renamed, or unpublished.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/blog"
              className="px-6 py-3 rounded-xl bg-[#0040DD] text-white font-bold text-sm shadow-lg hover:bg-[#0034b0] transition-colors"
            >
              Back to Blog Feed
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShareSocial = (platform: "linkedin" | "twitter" | "email") => {
    if (typeof window === "undefined") return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);

    let shareUrl = "";
    if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    } else if (platform === "email") {
      shareUrl = `mailto:?subject=${title}&body=Check out this article: ${url}`;
    }

    if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Convert raw markdown content into ultra-premium styled editorial blocks
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    let h2Counter = 0;

    return (
      <div className="space-y-6 text-slate-800 text-base sm:text-lg leading-[1.8] font-normal">
        {paragraphs.map((para, idx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          // ── H2 Major Section Heading ──
          if (trimmed.startsWith("## ")) {
            h2Counter++;
            const rawText = trimmed.replace(/^##\s+/, "");
            const headingId = slugifyHeading(rawText);

            return (
              <div key={idx} id={headingId} className="pt-8 sm:pt-10 scroll-mt-24 group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center size-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black tracking-wider border border-blue-200">
                    {h2Counter.toString().padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-950 tracking-tight leading-tight flex items-center justify-between">
                  <span>{rawText}</span>
                  <a
                    href={`#${headingId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(headingId);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity p-1"
                    title="Anchor link"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </h2>
              </div>
            );
          }

          // ── H3 Subsection Heading ──
          if (trimmed.startsWith("### ")) {
            const rawText = trimmed.replace(/^###\s+/, "");
            const headingId = slugifyHeading(rawText);

            return (
              <div key={idx} id={headingId} className="pt-5 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#0040DD] inline-block shrink-0" />
                  {rawText}
                </h3>
              </div>
            );
          }

          // ── Special Callout: Safety Reminder / OSHA Alert Box ──
          if (
            trimmed.includes("**Safety Reminder:**") ||
            trimmed.includes("**OSHA:**") ||
            trimmed.includes("Safety Violation")
          ) {
            const cleanText = trimmed.replace(/^>\s*/, "");
            return (
              <div
                key={idx}
                className="my-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-400/40 p-6 sm:p-7 shadow-lg shadow-amber-500/5 relative overflow-hidden"
              >
                <div className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="flex items-start gap-4 relative">
                  <div className="size-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                    <ShieldAlert className="size-6" />
                  </div>
                  <div>
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-md mb-2">
                      OSHA Safety Compliance Protocol
                    </span>
                    <p className="text-amber-950 font-medium text-sm sm:text-base leading-relaxed">
                      {cleanText.replace(/\*\*Safety Reminder:\*\*\s*/i, "")}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // ── Special Callout: Key Takeaway / Tactical Briefing Box ──
          if (
            trimmed.includes("**Key Takeaway:**") ||
            trimmed.includes("**Pro Tip:**") ||
            trimmed.includes("**Contractor Tip:**")
          ) {
            const cleanText = trimmed.replace(/^>\s*/, "");
            return (
              <div
                key={idx}
                className="my-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/20 border-2 border-blue-400/40 p-6 sm:p-7 shadow-lg shadow-blue-500/5 relative overflow-hidden"
              >
                <div className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-blue-400/20 blur-2xl" />
                <div className="flex items-start gap-4 relative">
                  <div className="size-11 rounded-xl bg-[#0040DD] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-100 px-2.5 py-0.5 rounded-md mb-2">
                      Operations Tactical Briefing
                    </span>
                    <p className="text-slate-900 font-semibold text-base sm:text-lg leading-relaxed">
                      {cleanText.replace(/\*\*Key Takeaway:\*\*\s*/i, "").replace(/^"|"$/g, "")}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // ── Standard Blockquote ──
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote
                key={idx}
                className="my-8 pl-6 sm:pl-8 border-l-4 border-[#0040DD] py-3 text-slate-800 italic font-serif text-lg sm:text-xl leading-relaxed bg-slate-50/80 rounded-r-2xl"
              >
                <p className="font-medium text-slate-900">
                  {trimmed.replace(/^>\s+/, "").replace(/^"|"$/g, "")}
                </p>
              </blockquote>
            );
          }

          // ── Numbered Inspection Protocol List ──
          if (/^\d+\.\s/.test(trimmed)) {
            const items = trimmed.split("\n").map((item) => item.replace(/^\d+\.\s+/, ""));
            return (
              <div key={idx} className="my-6 space-y-3">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-colors"
                  >
                    <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-black shrink-0 border border-blue-200 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
                      {it}
                    </p>
                  </div>
                ))}
              </div>
            );
          }

          // ── Bullet Point Checklist ──
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const items = trimmed.split("\n").map((item) => item.replace(/^[\*\-]\s+/, ""));
            return (
              <div key={idx} className="my-6 space-y-2.5">
                {items.map((it, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-1" />
                    <span className="text-slate-700 text-sm sm:text-base leading-relaxed">
                      {it}
                    </span>
                  </div>
                ))}
              </div>
            );
          }

          // ── Regular Paragraph ──
          return (
            <p key={idx} className="text-slate-700 text-base sm:text-lg leading-[1.8] font-normal">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <SiteLayout>
      {/* ── TOP READING PROGRESS BAR ── */}
      <div
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-[#0040DD] via-blue-500 to-indigo-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── SLIM FLOATING HEADER (Appears on scroll) ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 shadow-md ${
          showStickyNav
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="container-x max-w-6xl h-14 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/blog"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back to Blog"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider shrink-0">
              {post.category}
            </span>
            <p className="font-black text-slate-900 text-xs sm:text-sm truncate hidden sm:block">
              {post.title}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
              {Math.round(scrollProgress)}% read
            </span>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3 text-slate-400" />
                  Share
                </>
              )}
            </button>

            <Link
              to="/equipment"
              className="px-3.5 py-1.5 rounded-lg bg-[#0040DD] hover:bg-[#0034b0] text-white font-bold text-xs transition-colors shadow-xs"
            >
              Rent Equipment
            </Link>
          </div>
        </div>
      </div>

      {/* ── CINEMATIC EDITORIAL HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#061220] via-[#091b32] to-[#040d1a] text-white pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-white/10">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-24 right-1/4 size-96 rounded-full bg-[#0040DD]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="container-x max-w-4xl relative">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 overflow-x-auto scrollbar-none py-1">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-slate-500" />
            <Link to="/blog" className="hover:text-white transition-colors">
              Blog & Dispatch
            </Link>
            <ChevronRight className="size-3 text-slate-500" />
            <span className="text-blue-400 font-bold">{post.category}</span>
          </nav>

          {/* Verification Badge */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
              <ShieldCheck className="size-3.5 text-blue-400" />
              Verified Operations Protocol
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold border border-white/15">
              <Building2 className="size-3" />
              Greater Houston Commercial
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-white leading-[1.14] tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Lead Excerpt */}
          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-3xl">
            {post.excerpt}
          </p>

          {/* Author, Time & Action Strip */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Author */}
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg">
                <div className="size-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-sm">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <User className="size-6 text-blue-300" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-white leading-none">{post.author.name}</p>
                  <span className="size-1.5 rounded-full bg-emerald-400" title="Verified Author" />
                </div>
                <p className="text-xs text-slate-400 mt-1">{post.author.role}</p>
              </div>
            </div>

            {/* Read Stats & Quick Actions */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" />
                {post.readTime}
              </span>
              {post.views > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5 text-slate-400" />
                    {post.views.toLocaleString()} reads
                  </span>
                </>
              )}

              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1 p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Print / Save PDF"
              >
                <Printer className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── COVER IMAGE SHOWCASE ── */}
      <section className="bg-slate-950/5 py-8 sm:py-12 border-b border-slate-200">
        <div className="container-x max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 aspect-[16/9] max-h-[540px] group">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Floating Photo Seal */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 font-bold text-[11px] flex items-center gap-1.5">
                  <Truck className="size-3 text-blue-400" />
                  M3 Rental Commercial Fleet Dispatch
                </span>
                <span className="hidden sm:inline px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-300 text-[11px]">
                  Houston, TX
                </span>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-full bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="size-3 text-emerald-600" /> : <Share2 className="size-3" />}
                {copied ? "Link Copied" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN EDITORIAL LAYOUT ── */}
      <section className="py-12 sm:py-16 bg-white min-h-[600px]">
        <div className="container-x max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
            {/* ── LEFT / MAIN CONTENT (8 COLS) ── */}
            <div className="lg:col-span-8">
              {/* Mobile Table of Contents Accordion */}
              {tocItems.length > 0 && (
                <div className="lg:hidden mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm mb-3 uppercase tracking-wider">
                    <ListFilter className="size-4 text-blue-600" />
                    In This Operational Guide:
                  </div>
                  <ul className="space-y-2 text-xs font-medium text-slate-600">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(item.id);
                          }}
                          className="hover:text-blue-600 flex items-center gap-2 py-0.5"
                        >
                          <span className="size-1.5 rounded-full bg-blue-600" />
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formatted Content */}
              {renderFormattedContent(post.content)}

              {/* ── TAGS PILLS ── */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
                    <Tag className="size-3.5" /> Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to="/blog"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-colors border border-slate-200/80"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* ── INTERACTIVE FEEDBACK WIDGET ── */}
              <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      Was this operational checklist useful to your jobsite?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Our field coordinators refine checklists based on real contractor feedback.
                    </p>
                  </div>

                  {feedbackGiven ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Thank you for your feedback!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFeedbackGiven("helpful");
                          toast.success("Thank you for rating this guide!");
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ThumbsUp className="size-3.5 text-blue-600" />
                        Yes, very helpful
                      </button>
                      <button
                        onClick={() => {
                          setFeedbackGiven("feedback");
                          toast.info("Feel free to call dispatch with questions or suggestions.");
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageSquare className="size-3.5 text-slate-500" />
                        Have a suggestion
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── AUTHOR BIOGRAPHY CARD ── */}
              <div className="mt-12 p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0b1f3b] text-white shadow-xl relative overflow-hidden">
                <div className="pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative">
                  <div className="size-16 rounded-2xl bg-blue-600 p-0.5 shrink-0 shadow-lg">
                    <div className="size-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-xl">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <User className="size-8 text-blue-300" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">{post.author.name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                        Author
                      </span>
                    </div>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">{post.author.role}</p>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2.5 font-normal">
                      Directing commercial fleet telemetry, OSHA crane inspections, and turnkey delivery
                      coordination across Greater Houston civil projects.
                    </p>
                  </div>

                  <a
                    href={`tel:${site.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shrink-0 shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Phone className="size-3.5 text-[#0040DD]" />
                    Call Author
                  </a>
                </div>
              </div>
            </div>

            {/* ── RIGHT / STICKY ASIDE (4 COLS) ── */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Table of Contents Sticky Box */}
              {tocItems.length > 0 && (
                <div className="hidden lg:block sticky top-24 p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs uppercase tracking-wider mb-4 pb-3 border-b border-slate-200">
                    <ListFilter className="size-4 text-[#0040DD]" />
                    In This Briefing
                  </div>

                  <nav className="space-y-1.5 text-xs">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.id);
                        }}
                        className={`block py-1.5 px-2.5 rounded-lg font-medium transition-all ${
                          item.level === 3 ? "pl-5 text-slate-500 text-[11px]" : "text-slate-700"
                        } hover:bg-white hover:text-blue-600 hover:shadow-xs`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>

                  {/* Share Strip inside Sidebar */}
                  <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Share Guide
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                        title="Copy URL"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                      <button
                        onClick={() => handleShareSocial("linkedin")}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareSocial("twitter")}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-500 hover:bg-white transition-colors"
                        title="Share on X"
                      >
                        <Twitter className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareSocial("email")}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                        title="Share via Email"
                      >
                        <Mail className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Machinery Ready to Rent Widget */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#003da5] via-[#0040DD] to-[#1448df] text-white shadow-xl relative overflow-hidden">
                <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/10 blur-2xl" />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-3 border border-white/20">
                  <Truck className="size-3" /> Turnkey Delivery
                </span>
                <h4 className="text-xl font-black tracking-tight text-white leading-snug">
                  Need Equipment for This Protocol?
                </h4>
                <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                  Rent certified Tier-4 excavators, boom lifts, and heavy haulers delivered directly to
                  your Greater Houston jobsite.
                </p>

                {/* Featured Machinery mini-cards */}
                <div className="mt-5 space-y-3">
                  {FEATURED_MACHINERY.map((mach, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3 hover:bg-white/20 transition-all"
                    >
                      <img
                        src={mach.image}
                        alt={mach.name}
                        className="size-12 rounded-lg object-cover shrink-0 bg-slate-900"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{mach.name}</p>
                        <p className="text-[11px] text-amber-300 font-semibold">{mach.rate}</p>
                      </div>
                      <Link
                        to="/equipment"
                        className="p-1.5 rounded-lg bg-white text-[#0040DD] hover:bg-slate-100 transition-colors"
                        title="View Unit"
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/20 flex flex-col gap-2.5">
                  <Link
                    to="/equipment"
                    className="w-full py-3 rounded-xl bg-white text-[#0040DD] font-black text-xs text-center shadow-lg hover:bg-slate-100 transition-all"
                  >
                    Explore Full 70+ Machine Fleet
                  </Link>
                  <a
                    href={`tel:${site.phone}`}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center border border-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone className="size-3.5" />
                    Call Dispatch ({site.phone})
                  </a>
                </div>
              </div>

              {/* Dispatch Guarantee Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  M3 Houston Rental Guarantee
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-600" />
                    <span>100% pre-delivery safety inspection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-600" />
                    <span>24/7 on-call field maintenance team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-600" />
                    <span>Direct Houston, Harris & Fort Bend drop-off</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>

          {/* ── RELATED ARTICLES GRID ── */}
          {relatedPosts.length > 0 && (
            <div className="mt-20 pt-14 border-t border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Related Operations Guides
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Continue reading specialized commercial fleet articles.
                  </p>
                </div>
                <Link
                  to="/blog"
                  className="text-xs font-bold text-[#0040DD] hover:underline flex items-center gap-1"
                >
                  View All Briefings
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.id}
                    to="/blog/$slug"
                    params={{ slug: rel.slug }}
                    className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={rel.coverImage}
                          alt={rel.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          {rel.category}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-1.5 line-clamp-2 group-hover:text-[#0040DD] transition-colors leading-snug">
                          {rel.title}
                        </h4>
                        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{rel.readTime}</span>
                      <span className="text-[#0040DD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Guide <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
