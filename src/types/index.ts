export type UserRole = "user" | "admin" | "editor";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bookmarks: string[];
  readingHistory: ReadingHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingHistoryItem {
  articleId: string;
  readAt: Date;
}

export interface IArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  categorySlug: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  views: number;
  readingTime: number;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isSponsored: boolean;
  isPremium: boolean;
  publishedDate?: Date;
  updatedDate: Date;
  createdAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
}

export interface IComment {
  _id: string;
  articleId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
