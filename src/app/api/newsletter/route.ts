import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Newsletter } from "@/models/Newsletter";
import { newsletterSchema } from "@/lib/validations";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "auth");
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const existing = await Newsletter.findOne({ email: parsed.data.email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return apiResponse({ subscribed: true, message: "Already subscribed" });
    }

    await Newsletter.create({ email: parsed.data.email });
    return apiResponse({ subscribed: true }, 201);
  } catch {
    return apiError("Subscription failed", 500);
  }
}
