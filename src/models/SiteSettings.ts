import mongoose, { Schema, Document, Model } from "mongoose";
import type { IThemeSettings } from "@/types/theme";

export type { IThemeSettings };

export interface ISiteSettings extends Document {
  key: string;
  theme: IThemeSettings;
  updatedAt: Date;
}

const ThemeSchema = new Schema<IThemeSettings>(
  {
    primary: { type: String, default: "217 91% 55%" },
    primaryForeground: { type: String, default: "0 0% 100%" },
    brand: { type: String, default: "217 91% 55%" },
    ring: { type: String, default: "217 91% 55%" },
    radius: { type: String, default: "0.5rem" },
    preset: { type: String, default: "scholar-blue" },
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true },
    theme: { type: ThemeSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
