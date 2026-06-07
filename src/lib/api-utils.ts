import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { UserRole } from "@/lib/roles";

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function withAuth(
  roles: UserRole[] = ["user", "admin", "subadmin", "editor", "author"]
) {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  if (!roles.includes(session.user.role as UserRole)) {
    return { session: null, error: apiError("Forbidden", 403) };
  }
  return { session, error: null };
}

export async function withRateLimit(
  request: Request,
  type: "api" | "auth" | "search" = "api"
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  const result = await rateLimit(ip, type);
  if (!result.success) {
    return apiError("Too many requests. Please try again later.", 429);
  }
  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}
