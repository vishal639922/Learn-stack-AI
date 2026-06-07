import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { adminCreateUserSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";
import { canManageUsers, canAssignRole } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  if (!canManageUsers(session!.user.role)) {
    return apiError("Forbidden", 403);
  }

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
    return apiError("Users fetch fail ho gaya", 500);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  if (!canManageUsers(session!.user.role)) {
    return apiError("Forbidden", 403);
  }

  try {
    const body = await request.json();
    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    if (!canAssignRole(session!.user.role, parsed.data.role)) {
      return apiError("Aap ye role assign nahi kar sakte", 403);
    }

    await connectDB();

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return apiError("Ye email pehle se registered hai", 409);
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
    });

    return apiResponse(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch {
    return apiError("User create fail ho gaya", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  if (!canManageUsers(session!.user.role)) {
    return apiError("Forbidden", 403);
  }

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return apiError("userId aur role zaroori hai");
    }

    if (!["user", "admin", "subadmin", "editor", "author"].includes(role)) {
      return apiError("Invalid role");
    }

    if (!canAssignRole(session!.user.role, role as UserRole)) {
      return apiError("Aap ye role assign nahi kar sakte", 403);
    }

    await connectDB();

    const target = await User.findById(userId);
    if (!target) {
      return apiError("User not found", 404);
    }

    if (
      session!.user.id === userId &&
      role !== "admin" &&
      session!.user.role === "admin"
    ) {
      return apiError("Apna admin role change nahi kar sakte", 400);
    }

    target.role = role;
    await target.save();

    const user = await User.findById(userId).select("-password").lean();
    return apiResponse(user);
  } catch {
    return apiError("User update fail ho gaya", 500);
  }
}
