import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";
import { hashResetToken } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { token, password } = parsed.data;
    const tokenHash = hashResetToken(token);

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return apiError("Reset link invalid hai ya expire ho chuka hai", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword },
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
    });

    return apiResponse({ message: "Password update ho gaya. Ab sign in kar sakte ho." });
  } catch (error) {
    console.error("Reset password failed:", error);
    return apiError("Password reset fail ho gaya", 500);
  }
}
