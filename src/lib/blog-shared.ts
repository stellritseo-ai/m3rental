/**
 * Client-safe types, constants and utilities for M3 Rental Houston's Blog & Editorial Engine.
 * Shared by the public /blog and /blog/$slug routes, the dashboard console, and server functions.
 */

export const BLOG_STATUSES = ["published", "draft"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_CATEGORIES = [
  "Contractor Guides",
  "Fleet Logistics",
  "Jobsite Safety",
  "Industry News",
  "Equipment Maintenance",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string | undefined;
}

export interface BlogPostDoc {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // rich markdown / HTML formatted text
  coverImage: string; // Cloudinary permanent URL or high-res image URL
  coverImagePublicId?: string | undefined;
  category: string;
  tags: string[];
  author: BlogAuthor;
  readTime: string; // e.g. "5 min read"
  status: BlogStatus;
  views: number;
  featured: boolean;
  publishedAt: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function estimateReadTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}
