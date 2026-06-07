import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { themeSettingsSchema } from "@/lib/validations";
import { DEFAULT_THEME } from "@/lib/site-theme";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";
import { canManageTheme } from "@/lib/roles";

export async function GET() {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: "global" }).lean();
    return apiResponse(doc?.theme || DEFAULT_THEME);
  } catch {
    return apiResponse(DEFAULT_THEME);
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin"]);
  if (error) return error;

  if (!canManageTheme(session!.user.role)) {
    return apiError("Forbidden", 403);
  }

  try {
    const body = await request.json();
    const parsed = themeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const theme = {
      ...DEFAULT_THEME,
      ...parsed.data,
      primaryForeground: parsed.data.primaryForeground || "0 0% 100%",
      brand: parsed.data.brand || parsed.data.primary,
      ring: parsed.data.ring || parsed.data.primary,
    };

    const doc = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $set: { theme } },
      { upsert: true, new: true }
    ).lean();

    return apiResponse(doc.theme);
  } catch {
    return apiError("Theme update fail ho gaya", 500);
  }
}
