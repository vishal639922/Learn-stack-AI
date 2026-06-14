import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Naam kam se kam 2 characters ka hona chahiye").max(50),
  email: z.string().email("Galat email address"),
  password: z
    .string()
    .min(8, "Password kam se kam 8 characters ka hona chahiye")
    .regex(/[A-Z]/, "Ek uppercase letter hona chahiye")
    .regex(/[0-9]/, "Ek number hona chahiye"),
});

export const loginSchema = z.object({
  email: z.string().email("Galat email address"),
  password: z.string().min(1, "Password zaroori hai"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Galat email address"),
  context: z.enum(["user", "admin"]).default("user"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token zaroori hai"),
  password: z
    .string()
    .min(8, "Password kam se kam 8 characters ka hona chahiye")
    .regex(/[A-Z]/, "Ek uppercase letter hona chahiye")
    .regex(/[0-9]/, "Ek number hona chahiye"),
});

export const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(20, "Content bahut chhota hai"),
  contentFormat: z.enum(["markdown", "richtext"]).default("richtext"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).max(10).default([]),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "in_review", "approved", "rejected", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  articleId: z.string().min(1),
  parentId: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Galat email address"),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).default(""),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Naam kam se kam 2 characters ka hona chahiye").max(50),
  email: z.string().email("Galat email address"),
  password: z
    .string()
    .min(8, "Password kam se kam 8 characters ka hona chahiye")
    .regex(/[A-Z]/, "Ek uppercase letter hona chahiye")
    .regex(/[0-9]/, "Ek number hona chahiye"),
  role: z.enum(["user", "admin", "subadmin", "editor", "author"]),
});

export const themeSettingsSchema = z.object({
  primary: z.string().min(3).max(30),
  primaryForeground: z.string().min(3).max(30).optional(),
  brand: z.string().min(3).max(30).optional(),
  ring: z.string().min(3).max(30).optional(),
  radius: z.string().min(2).max(10).optional(),
  preset: z.string().max(50).optional(),
});

export const searchSchema = z.object({
  q: z.string().max(200).default(""),
  category: z.string().optional(),
  tags: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
