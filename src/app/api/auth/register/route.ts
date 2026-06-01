import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, getMongoUriFromEnv, isDbConfigured } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withRateLimit,
} from "@/lib/api-utils";
import { isAdminEmail, normalizeEmail } from "@/lib/admin-role";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    if (!isDbConfigured() || !getMongoUriFromEnv()) {
      const hint = process.env.VERCEL
        ? "Database not configured on server. In Vercel: add MONGODB_URI (connection string only), enable Production, then Redeploy."
        : "Add MONGODB_URI to .env.local and restart npm run dev.";
      return apiError(hint, 503);
    }

    await connectDB();

    const email = normalizeEmail(parsed.data.email);
    const existing = await User.findOne({ email });
    if (existing) {
      return apiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const isAdmin = isAdminEmail(email);

    const user = await User.create({
      name: parsed.data.name,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
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
  } catch (error) {
    console.error("Registration failed:", error);
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return apiError(message, 500);
  }
}
