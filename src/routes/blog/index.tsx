import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Eye,
  SlidersHorizontal,
  X,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { getBlogPostsDb } from "@/lib/api/blog.functions";
import {
  BLOG_CATEGORIES,
  type BlogPostDoc,
} from "@/lib/blog-shared";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    try {
      const res = await getBlogPostsDb({ data: {} });
      return {
        initialPosts: (res?.posts || []) as BlogPostDoc[],
        initialCategories: (res?.categories || []) as string[],
        initialTotal: res?.total || 0,
      };
    } catch (err) {
      console.error("Failed to load blog posts:", err);
      return {
        initialPosts: [] as BlogPostDoc[],
        initialCategories: [] as string[],
        initialTotal: 0,
      };
    }
  },
  head: () => ({
    meta: [
      {
        title: "Industry Insights & Equipment Guides | M3 Rental Houston",
      },
      {
        name: "description",
        content:
          "Expert insights, OSHA safety checklists, fleet logistics guides, and commercial equipment strategies for Greater Houston contractors and builders.",
      },
      {
        property: "og:title",
        content: "Commercial Fleet & Construction Blog | M3 Rental Houston",
      },
      {
        property: "og:description",
        content:
          "Actionable jobsite guides, equipment maintenance tips, and heavy hauling insights from M3 Rental Houston operations specialists.",
      },
    ],
  }),
  component: BlogIndexPage,
});

function formatDate(iso: string): string {
  if (!iso) return "Recently";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Contractor Guides": {
    bg: "bg-blue-50 text-blue-700",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Fleet Logistics": {
    bg: "bg-indigo-50 text-indigo-700",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  "Jobsite Safety": {
    bg: "bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Industry News": {
    bg: "bg-amber-50 text-amber-800",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  "Equipment Maintenance": {
    bg: "bg-purple-50 text-purple-700",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};

function getCategoryTheme(cat: string) {
  return (
    CATEGORY_COLORS[cat] || {
      bg: "bg-slate-100 text-slate-700",
      text: "text-slate-700",
      border: "border-slate-200",
    }
  );
}

function BlogIndexPage() {
  const loaderData = Route.useLoaderData();
  const [posts] = useState<BlogPostDoc[]>(loaderData.initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    BLOG_CATEGORIES.forEach((c) => set.add(c));
    loaderData.initialCategories.forEach((c) => set.add(c));
    return Array.from(set);
  }, [loaderData.initialCategories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCat =
        selectedCategory === "All" || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0] || null;
  }, [posts]);

  const regularPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    // If user is searching or filtering by category, show all matching results
    if (selectedCategory !== "All" || searchQuery.trim()) {
      return filteredPosts;
    }
    // Otherwise don't duplicate featured post in grid
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost, selectedCategory, searchQuery]);

  return (
    <SiteLayout>
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#08182c] via-[#0b213f] to-[#0a1a30] text-white pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-white/10">
        {/* Glow ambient effects */}
        <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-[#0040DD]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="container-x relative max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="size-3.5 text-blue-400" />
              M3 Rental Editorial & Operations Dispatch
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Jobsite Intelligence & Commercial Fleet Insights
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal">
              Practical guides, OSHA compliance protocols, heavy rigging checklists, and fleet logistics
              engineered specifically for Gulf Coast builders and contractors.
            </p>
          </div>

          {/* Quick Search & Stats Bar */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, safety rules..."
                className="w-full h-12 pl-11 pr-10 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{posts.length} Verified Articles</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Truck className="size-3.5 text-blue-400" />
                <span>Houston Fleet Operations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER PILLS ── */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="container-x max-w-6xl py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline-flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="size-3.5" />
              Topic:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? "bg-[#0040DD] text-white shadow-md shadow-blue-500/25 scale-102"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT FEED ── */}
      <section className="py-12 sm:py-16 bg-[#F8FAF9] min-h-[500px]">
        <div className="container-x max-w-6xl space-y-12">
          {/* FEATURED ARTICLE HERO (Shown only on initial unfiltered view) */}
          {featuredPost && selectedCategory === "All" && !searchQuery.trim() && (
            <Reveal>
              <div className="relative group overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Image Column */}
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[320px] overflow-hidden bg-slate-900">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5">
                        <Sparkles className="size-3.5 fill-slate-950" />
                        Featured Guide
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 ${getCategoryTheme(featuredPost.category).border} ${getCategoryTheme(featuredPost.category).text}`}
                      >
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5 text-slate-400" />
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-slate-400" />
                          {featuredPost.readTime}
                        </span>
                        {featuredPost.views > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="size-3.5 text-slate-400" />
                              {featuredPost.views} reads
                            </span>
                          </>
                        )}
                      </div>

                      <Link
                        to="/blog/$slug"
                        params={{ slug: featuredPost.slug }}
                        className="group-hover:text-[#0040DD] transition-colors"
                      >
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                        {featuredPost.excerpt}
                      </p>

                      {/* Tags */}
                      {featuredPost.tags && featuredPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {featuredPost.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-sm overflow-hidden">
                          {featuredPost.author.avatar ? (
                            <img
                              src={featuredPost.author.avatar}
                              alt={featuredPost.author.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <User className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none">
                            {featuredPost.author.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {featuredPost.author.role}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/blog/$slug"
                        params={{ slug: featuredPost.slug }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0040DD] hover:bg-[#0034b0] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 group-hover:scale-105"
                      >
                        Read Full Guide
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* GRID OF ARTICLES */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCategory === "All"
                    ? "Latest Articles & Case Studies"
                    : `${selectedCategory} Articles`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Showing {regularPosts.length} {regularPosts.length === 1 ? "article" : "articles"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {regularPosts.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 p-8">
                <BookOpen className="size-12 mx-auto text-slate-400 mb-4" />
                <h4 className="text-lg font-bold text-slate-900">No articles found</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                  We couldn't find any articles matching your search or category filter. Try clearing your
                  search or choosing another category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-[#0040DD] text-white text-xs font-bold hover:bg-[#0034b0] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {regularPosts.map((post) => {
                  const theme = getCategoryTheme(post.category);
                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/40 transition-all duration-300"
                    >
                      {/* Card Cover Image */}
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md bg-white/95 shadow-xs ${theme.border} ${theme.text}`}
                          >
                            {post.category}
                          </span>
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Metadata row */}
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-slate-400" />
                              {formatDate(post.publishedAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-slate-400" />
                              {post.readTime}
                            </span>
                          </div>

                          <Link
                            to="/blog/$slug"
                            params={{ slug: post.slug }}
                            className="block group-hover:text-[#0040DD] transition-colors"
                          >
                            <h4 className="text-lg font-black text-slate-900 leading-snug line-clamp-2 tracking-tight">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2.5 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author & Footer Link */}
                        <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-600 text-xs font-bold">
                              {post.author.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                post.author.name[0] || "M"
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                              {post.author.name}
                            </span>
                          </div>

                          <Link
                            to="/blog/$slug"
                            params={{ slug: post.slug }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0040DD] group-hover:translate-x-0.5 transition-transform"
                          >
                            Read More
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CTA BANNER: RENT OR DISCUSS LOGISTICS ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0038B8] via-[#0040DD] to-[#1649E8] text-white p-8 sm:p-12 shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
                <Truck className="size-3.5" />
                Immediate Dispatch Available
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Need Commercial Heavy Machinery for Your Houston Project?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed">
                Browse our 70+ piece Tier-4 verified fleet of excavators, cranes, lowboys, and reach
                forklifts with guaranteed on-time site drop-off.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/equipment"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0040DD] font-black text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-102"
                >
                  Browse Rental Fleet
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur-md transition-all"
                >
                  Sell Surplus Equipment
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
