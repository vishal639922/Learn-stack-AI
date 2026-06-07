import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return apiResponse(categories);
  } catch {
    return apiError("Failed to fetch categories", 500);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const existing = await Category.findOne({ slug: parsed.data.slug });
    if (existing) {
      return apiError("Category slug already exists", 409);
    }

    const category = await Category.create(parsed.data);
    return apiResponse(category, 201);
  } catch {
    return apiError("Failed to create category", 500);
  }
}
