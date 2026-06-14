import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: "markdown" | "richtext";
  featuredImage?: string;
  featuredImagePublicId?: string;
  category: mongoose.Types.ObjectId;
  tags: string[];
  author: mongoose.Types.ObjectId;
  views: number;
  readingTime: number;
  status: "draft" | "in_review" | "approved" | "rejected" | "published" | "archived";
  isFeatured: boolean;
  isSponsored: boolean;
  isPremium: boolean;
  sortOrder: number;
  publishedDate?: Date;
  updatedDate: Date;
  metaTitle?: string;
  metaDescription?: string;
  reviewComment?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    contentFormat: {
      type: String,
      enum: ["markdown", "richtext"],
      default: "markdown",
    },
    featuredImage: { type: String },
    featuredImagePublicId: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "in_review", "approved", "rejected", "published", "archived"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    publishedDate: { type: Date },
    updatedDate: { type: Date, default: Date.now },
    metaTitle: { type: String },
    metaDescription: { type: String },
    reviewComment: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ArticleSchema.index({ category: 1, status: 1, sortOrder: 1 });
ArticleSchema.index({ status: 1, publishedDate: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ views: -1 });
ArticleSchema.index(
  { title: "text", content: "text", tags: "text", excerpt: "text" },
  { weights: { title: 10, tags: 5, excerpt: 3, content: 1 } }
);

export const Article: Model<IArticle> =
  mongoose.models.Article ||
  mongoose.model<IArticle>("Article", ArticleSchema);