import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import type { IThemeSettings } from "@/types/theme";
import { DEFAULT_THEME } from "@/lib/site-theme-presets";

export {
  THEME_PRESETS,
  DEFAULT_THEME,
  themeToCssVars,
  hexToHsl,
  hslToHex,
} from "@/lib/site-theme-presets";

export async function getSiteTheme(): Promise<IThemeSettings> {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne({ key: "global" }).lean();
    if (doc?.theme) return doc.theme as IThemeSettings;
  } catch {
    // fall through to default
  }
  return DEFAULT_THEME;
}
