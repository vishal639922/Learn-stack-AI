import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin"]);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    return apiResponse({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Failed to fetch users", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin"]);
  if (error) return error;

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return apiError("userId and role are required");
    }

    if (!["user", "admin", "editor"].includes(role)) {
      return apiError("Invalid role");
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse(user);
  } catch {
    return apiError("Failed to update user", 500);
  }
}
