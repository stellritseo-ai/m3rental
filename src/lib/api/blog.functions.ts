import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { verifyAdminSession } from "./auth.functions";
import {
  CLOUDINARY_BLOG_FOLDER,
  deleteFromCloudinary,
  isDataUrl,
  uploadToCloudinary,
} from "../cloudinary.server";
import {
  estimateReadTime,
  slugify,
  type BlogPostDoc,
  type BlogStatus,
} from "../blog-shared";

export type { BlogPostDoc, BlogStatus } from "../blog-shared";

const COLLECTION = "blog_posts";

async function checkAdmin(token: string | undefined): Promise<boolean> {
  try {
    const res = await verifyAdminSession({ data: { token } });
    return Boolean(res?.valid);
  } catch {
    return false;
  }
}

function mapDoc(doc: any): BlogPostDoc {
  return {
    id: String(doc.id || doc._id),
    slug: String(doc.slug),
    title: String(doc.title || "Untitled"),
    excerpt: String(doc.excerpt || ""),
    content: String(doc.content || ""),
    coverImage: String(doc.coverImage || ""),
    coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : undefined,
    category: String(doc.category || "General"),
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    author: {
      name: String(doc.author?.name || "M3 Editorial Team"),
      role: String(doc.author?.role || "Fleet Operations"),
      avatar: doc.author?.avatar ? String(doc.author.avatar) : undefined,
    },
    readTime: String(doc.readTime || "5 min read"),
    status: (doc.status === "draft" ? "draft" : "published") as BlogStatus,
    views: Number(doc.views || 0),
    featured: Boolean(doc.featured),
    publishedAt: String(doc.publishedAt || doc.createdAt || new Date().toISOString()),
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

// ── 1. Public: Get Published Blog Posts with Category & Search Filters ────────
export const getBlogPostsDb = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().max(50).optional(),
    })
  )
  .handler(async ({ data }) => {
    const db = await connectDB();
    if (!db) {
      return { posts: [] as BlogPostDoc[], total: 0, categories: [] as string[] };
    }

    const query: Record<string, any> = { status: "published" };

    if (data.category && data.category !== "All") {
      query["category"] = data.category;
    }

    if (data.search && data.search.trim()) {
      const q = data.search.trim();
      query["$or"] = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const limit = data.limit ?? 20;
    const page = data.page ?? 1;
    const skip = (page - 1) * limit;

    const col = db.collection(COLLECTION);

    const [docs, total, categories] = await Promise.all([
      col
        .find(query)
        .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      col.countDocuments(query),
      col.distinct("category", { status: "published" }),
    ]);

    return {
      posts: docs.map(mapDoc),
      total,
      categories: (categories as string[]).filter(Boolean),
    };
  });

// ── 2. Public: Get Single Published Article by Slug + Related Articles ────────
export const getBlogPostBySlugDb = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      slug: z.string(),
      incrementViews: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    const db = await connectDB();
    if (!db) {
      return { post: null as BlogPostDoc | null, relatedPosts: [] as BlogPostDoc[] };
    }

    const col = db.collection(COLLECTION);

    // Atomically increment views if not explicitly disabled
    let doc: any = null;
    if (data.incrementViews !== false) {
      const res = await col.findOneAndUpdate(
        { slug: data.slug, status: "published" },
        { $inc: { views: 1 } },
        { returnDocument: "after" }
      );
      doc = res;
    } else {
      doc = await col.findOne({ slug: data.slug, status: "published" });
    }

    if (!doc) {
      // Also check if admin is viewing a draft
      const draftDoc = await col.findOne({ slug: data.slug });
      if (!draftDoc) {
        return { post: null, relatedPosts: [] };
      }
      doc = draftDoc;
    }

    const post = mapDoc(doc);

    // Fetch related articles (same category, excluding current post)
    const relatedDocs = await col
      .find({
        status: "published",
        slug: { $ne: data.slug },
        ...(doc.category ? { category: doc.category } : {}),
      })
      .sort({ publishedAt: -1 })
      .limit(3)
      .toArray();

    return {
      post,
      relatedPosts: relatedDocs.map(mapDoc),
    };
  });

// ── 3. Admin: List All Posts (Drafts & Published) + Operational Stats ─────────
export const getAdminBlogPostsDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      category: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const authorized = await checkAdmin(data.token);
    if (!authorized) {
      return {
        success: false as const,
        error: "Unauthorized: admin login required.",
        posts: [] as BlogPostDoc[],
        stats: { total: 0, published: 0, drafts: 0, totalViews: 0 },
      };
    }

    const db = await connectDB();
    if (!db) {
      return {
        success: false as const,
        error: "Database unavailable.",
        posts: [] as BlogPostDoc[],
        stats: { total: 0, published: 0, drafts: 0, totalViews: 0 },
      };
    }

    const col = db.collection(COLLECTION);
    const filter: Record<string, any> = {};

    if (data.status && data.status !== "all") {
      filter["status"] = data.status;
    }

    if (data.category && data.category !== "all") {
      filter["category"] = data.category;
    }

    if (data.search && data.search.trim()) {
      const q = data.search.trim();
      filter["$or"] = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { "author.name": { $regex: q, $options: "i" } },
      ];
    }

    const [docs, allDocs] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).toArray(),
      col.find({}).project({ status: 1, views: 1 }).toArray(),
    ]);

    const stats = {
      total: allDocs.length,
      published: allDocs.filter((d: any) => d.status === "published").length,
      drafts: allDocs.filter((d: any) => d.status === "draft").length,
      totalViews: allDocs.reduce((acc: number, d: any) => acc + (Number(d.views) || 0), 0),
    };

    return {
      success: true as const,
      posts: docs.map(mapDoc),
      stats,
    };
  });

// ── 4. Admin: Create New Blog Post with Cloudinary Cover Image ────────────────
export const createBlogPostDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().optional(),
      title: z.string().trim().min(3).max(200),
      slug: z.string().trim().optional(),
      excerpt: z.string().trim().min(10).max(600),
      content: z.string().trim().min(20),
      category: z.string().trim().min(1).max(80),
      tags: z.array(z.string()).default([]),
      authorName: z.string().trim().min(2).max(100).default("M3 Editorial Team"),
      authorRole: z.string().trim().min(2).max(100).default("Fleet Operations"),
      coverImage: z.string().min(1),
      status: z.enum(["published", "draft"]).default("published"),
      featured: z.boolean().default(false),
      readTime: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const authorized = await checkAdmin(data.token);
    if (!authorized) {
      return { success: false as const, error: "Unauthorized: admin login required." };
    }

    const db = await connectDB();
    if (!db) {
      return { success: false as const, error: "Database unavailable." };
    }

    const col = db.collection(COLLECTION);

    // 1. Handle image upload to Cloudinary if it's a data URL
    let coverImage = data.coverImage;
    let coverImagePublicId: string | undefined = undefined;

    if (isDataUrl(coverImage)) {
      try {
        const upload = await uploadToCloudinary(coverImage, CLOUDINARY_BLOG_FOLDER);
        coverImage = upload.url;
        coverImagePublicId = upload.publicId;
      } catch (err: any) {
        return {
          success: false as const,
          error: `Cover image upload failed: ${err?.message || "Unknown Cloudinary error"}`,
        };
      }
    }

    // 2. Compute unique slug
    let baseSlug = slugify(data.slug?.trim() || data.title);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while ((await col.countDocuments({ slug })) > 0) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const id = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const readTime = data.readTime?.trim() || estimateReadTime(data.content);

    const newPost: BlogPostDoc = {
      id,
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage,
      coverImagePublicId,
      category: data.category,
      tags: data.tags,
      author: {
        name: data.authorName,
        role: data.authorRole,
        avatar: undefined,
      },
      readTime,
      status: data.status,
      views: 0,
      featured: data.featured,
      publishedAt: data.status === "published" ? now : "",
      createdAt: now,
      updatedAt: now,
    };

    await col.insertOne(newPost);

    return {
      success: true as const,
      post: newPost,
    };
  });

// ── 5. Admin: Update Existing Blog Post ────────────────────────────────────────
export const updateBlogPostDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().optional(),
      id: z.string(),
      title: z.string().trim().min(3).max(200),
      slug: z.string().trim().optional(),
      excerpt: z.string().trim().min(10).max(600),
      content: z.string().trim().min(20),
      category: z.string().trim().min(1).max(80),
      tags: z.array(z.string()).default([]),
      authorName: z.string().trim().min(2).max(100),
      authorRole: z.string().trim().min(2).max(100),
      coverImage: z.string().min(1),
      status: z.enum(["published", "draft"]),
      featured: z.boolean(),
      readTime: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const authorized = await checkAdmin(data.token);
    if (!authorized) {
      return { success: false as const, error: "Unauthorized: admin login required." };
    }

    const db = await connectDB();
    if (!db) {
      return { success: false as const, error: "Database unavailable." };
    }

    const col = db.collection(COLLECTION);
    const existing: any = await col.findOne({ id: data.id });
    if (!existing) {
      return { success: false as const, error: "Article not found." };
    }

    let coverImage = data.coverImage;
    let coverImagePublicId = existing.coverImagePublicId as string | undefined;

    // If new base64 image provided, upload and purge old
    if (isDataUrl(coverImage)) {
      try {
        const upload = await uploadToCloudinary(coverImage, CLOUDINARY_BLOG_FOLDER);
        if (coverImagePublicId) {
          await deleteFromCloudinary(coverImagePublicId).catch(() => {});
        }
        coverImage = upload.url;
        coverImagePublicId = upload.publicId;
      } catch (err: any) {
        return {
          success: false as const,
          error: `Cover image update failed: ${err?.message || "Unknown error"}`,
        };
      }
    }

    // Slug check: ensure unique if changed
    let slug = existing.slug;
    if (data.slug && data.slug.trim() && data.slug !== existing.slug) {
      const candidateSlug = slugify(data.slug);
      const conflict = await col.findOne({ slug: candidateSlug, id: { $ne: data.id } });
      if (conflict) {
        slug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        slug = candidateSlug;
      }
    }

    const now = new Date().toISOString();
    const publishedAt =
      existing.publishedAt || (data.status === "published" ? now : "");

    const updateFields: Partial<BlogPostDoc> = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      author: {
        name: data.authorName,
        role: data.authorRole,
        avatar: existing.author?.avatar || undefined,
      },
      coverImage,
      coverImagePublicId,
      status: data.status,
      featured: data.featured,
      readTime: data.readTime?.trim() || estimateReadTime(data.content),
      publishedAt,
      updatedAt: now,
    };

    await col.updateOne({ id: data.id }, { $set: updateFields });
    const updated = await col.findOne({ id: data.id });

    return {
      success: true as const,
      post: mapDoc(updated),
    };
  });

// ── 6. Admin: Delete Blog Post + Purge Cloudinary Asset ────────────────────────
export const deleteBlogPostDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().optional(),
      id: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const authorized = await checkAdmin(data.token);
    if (!authorized) {
      return { success: false as const, error: "Unauthorized: admin login required." };
    }

    const db = await connectDB();
    if (!db) {
      return { success: false as const, error: "Database unavailable." };
    }

    const col = db.collection(COLLECTION);
    const existing: any = await col.findOne({ id: data.id });
    if (!existing) {
      return { success: false as const, error: "Article not found." };
    }

    if (existing.coverImagePublicId) {
      await deleteFromCloudinary(existing.coverImagePublicId).catch(() => {});
    }

    await col.deleteOne({ id: data.id });

    return { success: true as const };
  });
