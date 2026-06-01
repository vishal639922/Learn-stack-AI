import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withRateLimit,
} from "@/lib/api-utils";
import { isAdminEmail } from "@/lib/admin-role";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return apiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const isAdmin = isAdminEmail(parsed.data.email);

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
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
