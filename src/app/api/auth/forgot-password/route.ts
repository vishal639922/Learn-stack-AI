import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";
import { generateResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { STAFF_ROLES } from "@/lib/roles";
import { siteConfig } from "@/config/site";

const GENERIC_MESSAGE =
  "Agar is email se account registered hai, to password reset link bhej diya gaya hai.";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { email, context } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return apiResponse({ message: GENERIC_MESSAGE });
    }

    const isStaff = STAFF_ROLES.includes(user.role);
    if (context === "admin" && !isStaff) {
      return apiResponse({ message: GENERIC_MESSAGE });
    }
    if (context === "user" && isStaff) {
      return apiResponse({ message: GENERIC_MESSAGE });
    }

    const { raw, hash, expires } = generateResetToken();
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${siteConfig.url}/reset-password?token=${raw}&context=${context}`;
    await sendPasswordResetEmail(user.email, resetUrl, context);

    return apiResponse({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return apiError("Password reset request fail ho gaya", 500);
  }
}
