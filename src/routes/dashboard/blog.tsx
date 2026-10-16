import { useEffect, useMemo, useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  User,
  SlidersHorizontal,
  Layers,
  TrendingUp,
  Globe,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import {
  getAdminBlogPostsDb,
  createBlogPostDb,
  updateBlogPostDb,
  deleteBlogPostDb,
} from "@/lib/api/blog.functions";
import {
  BLOG_CATEGORIES,
  BLOG_STATUSES,
  estimateReadTime,
  slugify,
  type BlogPostDoc,
  type BlogStatus,
} from "@/lib/blog-shared";

export const Route = createFileRoute("/dashboard/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Editorial Console — Dashboard | M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardBlogPage,
});

function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("m3_admin_session_token") || undefined;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface ArticleFormState {
  id?: string | undefined;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  tagsString: string;
  readTime: string;
  status: BlogStatus;
  featured: boolean;
}

const INITIAL_FORM: ArticleFormState = {
  id: undefined,
  title: "",
  slug: "",
  category: "Contractor Guides",
  excerpt: "",
  content: "",
  coverImage: "",
  authorName: "Marcus Vance",
  authorRole: "M3 Fleet Operations Director",
  tagsString: "Houston Construction, Fleet Management",
  readTime: "5 min read",
  status: "published",
  featured: false,
};

function DashboardBlogPage() {
  const [posts, setPosts] = useState<BlogPostDoc[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ArticleFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [imagePreview, setImagePreview] = useState<string>("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<BlogPostDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const token = getStoredToken();
      const res = await getAdminBlogPostsDb({
        data: {
          token,
          status: statusFilter,
          category: categoryFilter,
          search: search.trim() ? search.trim() : undefined,
        },
      });

      if (res && res.success) {
        setPosts(res.posts);
        setStats(res.stats);
      } else {
        toast.error(res?.error || "Failed to load blog articles");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error connecting to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm(INITIAL_FORM);
    setImagePreview("");
    setActiveTab("write");
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPostDoc) => {
    setIsEditing(true);
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      authorName: post.author.name,
      authorRole: post.author.role,
      tagsString: (post.tags || []).join(", "),
      readTime: post.readTime,
      status: post.status,
      featured: post.featured,
    });
    setImagePreview(post.coverImage);
    setActiveTab("write");
    setIsModalOpen(true);
  };

  // Auto-slug generator on title change
  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const next = { ...prev, title: val };
      if (!isEditing || !prev.slug) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  // Content change auto-estimates read time
  const handleContentChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      content: val,
      readTime: estimateReadTime(val),
    }));
  };

  // Handle local image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm((prev) => ({ ...prev, coverImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveArticle = async (statusOverride?: BlogStatus) => {
    if (!form.title.trim()) {
      toast.error("Please enter an article title");
      return;
    }
    if (!form.excerpt.trim()) {
      toast.error("Please provide a short excerpt / summary");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Please write some article content");
      return;
    }
    if (!form.coverImage.trim()) {
      toast.error("Please upload or provide a cover image");
      return;
    }

    const targetStatus = statusOverride || form.status;
    const token = getStoredToken();
    setSubmitting(true);

    const tags = form.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (isEditing && form.id) {
        const res = await updateBlogPostDb({
          data: {
            token,
            id: form.id,
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: form.content,
            category: form.category,
            tags,
            authorName: form.authorName,
            authorRole: form.authorRole,
            coverImage: form.coverImage,
            status: targetStatus,
            featured: form.featured,
            readTime: form.readTime,
          },
        });

        if (res && res.success) {
          toast.success("Article updated successfully!");
          setIsModalOpen(false);
          fetchPosts();
        } else {
          toast.error(res?.error || "Failed to update article");
        }
      } else {
        const res = await createBlogPostDb({
          data: {
            token,
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: form.content,
            category: form.category,
            tags,
            authorName: form.authorName,
            authorRole: form.authorRole,
            coverImage: form.coverImage,
            status: targetStatus,
            featured: form.featured,
            readTime: form.readTime,
          },
        });

        if (res && res.success) {
          toast.success("Article published successfully to the blog!");
          setIsModalOpen(false);
          fetchPosts();
        } else {
          toast.error(res?.error || "Failed to create article");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = getStoredToken();

    try {
      const res = await deleteBlogPostDb({
        data: {
          token,
          id: deleteTarget.id,
        },
      });

      if (res && res.success) {
        toast.success(`"${deleteTarget.title}" deleted.`);
        setDeleteTarget(null);
        fetchPosts();
      } else {
        toast.error("Failed to delete article");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="size-3.5" />
            Editorial Engine & Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Blog & Article Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Write, publish, and manage commercial equipment guides, OSHA updates, and logistics articles
            synced with MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts()}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh articles"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
          >
            <Globe className="size-3.5 text-slate-400" />
            View Live Blog
            <ExternalLink className="size-3 text-slate-400" />
          </a>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0034b0] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-102"
          >
            <Plus className="size-4" />
            Write New Article
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Articles</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <Layers className="size-3 text-blue-500" /> In Database
            </p>
          </div>
          <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="size-6" />
          </div>
        </div>

        {/* Published */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Published</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.published}</p>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="size-3" /> Live on /blog
            </p>
          </div>
          <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="size-6" />
          </div>
        </div>

        {/* Drafts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Drafts</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.drafts}</p>
            <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-semibold">
              <Lock className="size-3" /> Unpublished
            </p>
          </div>
          <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Edit3 className="size-6" />
          </div>
        </div>

        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Views</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats.totalViews.toLocaleString()}
            </p>
            <p className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="size-3" /> Client Reads
            </p>
          </div>
          <div className="size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Eye className="size-6" />
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search article titles, tags, excerpt..."
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTimeout(() => fetchPosts(), 50);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "published"
                  ? "bg-white text-emerald-700 shadow-xs font-black"
                  : "text-slate-600"
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "draft"
                  ? "bg-white text-amber-700 shadow-xs font-black"
                  : "text-slate-600"
              }`}
            >
              Drafts ({stats.drafts})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── ARTICLES DATA TABLE ── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="size-8 mx-auto text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-600">Loading articles from MongoDB...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="size-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No articles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No articles match your current search or status filter. Write your first article or reset
              filters.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 px-4 py-2 rounded-xl bg-[#0040DD] text-white text-xs font-bold hover:bg-[#0034b0] transition-colors"
            >
              Write First Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Article & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Published</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Article & Details */}
                    <td className="py-4 px-6 max-w-md">
                      <div className="flex items-start gap-3.5">
                        <div className="size-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </span>
                            {post.featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300/60 shrink-0">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{post.excerpt}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                            <span>/blog/{post.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {post.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          {post.author.name[0] || "M"}
                        </div>
                        <span className="font-medium text-slate-700">{post.author.name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-semibold">
                      <div className="flex items-center gap-1">
                        <Eye className="size-3 text-slate-400" />
                        {post.views}
                      </div>
                    </td>

                    {/* Published Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View on Live Site"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Article"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── WRITE / EDIT ARTICLE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {isEditing ? "Edit Article & Publishing Details" : "Write New Commercial Article"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Articles are automatically optimized, uploaded to Cloudinary, and saved in MongoDB.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Title & Slug */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. OSHA & Heavy Machinery Safety Checklist for Gulf Coast Sites"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      URL Slug (Auto-generated) *
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                      placeholder="osha-heavy-machinery-safety-checklist"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {BLOG_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload (Cloudinary) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Image (Cloudinary Powered) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 aspect-[16/10] rounded-2xl bg-slate-100 border border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="size-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-md"
                          >
                            Change Image
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="size-8 mx-auto text-slate-400 mb-1" />
                        <p className="text-[11px] font-bold text-slate-500">No Image Selected</p>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="size-4" />
                      Upload High-Resolution Photo from Computer
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Or URL:</span>
                      <input
                        type="url"
                        value={form.coverImage.startsWith("data:") ? "" : form.coverImage}
                        onChange={(e) => {
                          const url = e.target.value;
                          setForm({ ...form, coverImage: url });
                          setImagePreview(url);
                        }}
                        placeholder="Paste image web link (e.g. Unsplash or Cloudinary)..."
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="A short, compelling summary (1-3 sentences) displayed on cards and search engines..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Author & Read Time & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author Role / Title
                  </label>
                  <input
                    type="text"
                    value={form.authorRole}
                    onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={form.tagsString}
                  onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
                  placeholder="Houston, OSHA, Heavy Cranes, Logistics"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content Editor with Write vs Live Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Article Body & Markdown Content *
                  </label>

                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeTab === "write" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeTab === "preview"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600"
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <div className="space-y-2">
                    {/* Quick Markdown Toolbar Helpers */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, content: prev.content + "\n\n## Subheading Here\n" }))}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold"
                      >
                        + H2 Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, content: prev.content + "\n\n### Section Title\n" }))}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold"
                      >
                        + H3 Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, content: prev.content + '\n\n> "Important contractor quote or key takeaway"\n' }))}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold"
                      >
                        + Quote Box
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, content: prev.content + "\n* Inspection point 1\n* Inspection point 2\n* Inspection point 3\n" }))}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold"
                      >
                        + Bullet List
                      </button>
                    </div>

                    <textarea
                      rows={12}
                      value={form.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Write your article content using standard formatting or Markdown (## Heading, * bullet point, > blockquote)..."
                      className="w-full p-4 rounded-xl border border-slate-200 text-slate-800 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 max-h-96 overflow-y-auto space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">{form.title || "Untitled Article"}</h3>
                    <p className="text-sm text-slate-500 italic">{form.excerpt}</p>
                    <hr className="border-slate-200" />
                    <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {form.content || "No content entered yet."}
                    </div>
                  </div>
                )}
              </div>

              {/* Options: Featured & Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="size-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Pin as Featured Guide</span>
                    <p className="text-[11px] text-slate-500">
                      Displays prominently in the large top hero card on /blog
                    </p>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Publishing State:</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveArticle("draft")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveArticle("published")}
                  className="px-6 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0034b0] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      Saving to Cloudinary & DB...
                    </>
                  ) : isEditing ? (
                    "Update & Publish"
                  ) : (
                    "Publish Article"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="size-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Delete this article?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">"{deleteTarget.title}"</span>? This will
              remove the article from MongoDB and permanently purge its image asset from Cloudinary.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeletePost}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                {deleting ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
