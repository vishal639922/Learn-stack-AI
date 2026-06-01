import type { IUser } from "@/models/User";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;
  return normalizeEmail(email) === adminEmail;
}

/** Promote ADMIN_EMAIL user to admin in the database if needed. */
export async function ensureAdminRole(user: IUser): Promise<IUser["role"]> {
  if (!isAdminEmail(user.email)) return user.role;
  if (user.role === "admin") return "admin";
  user.role = "admin";
  await user.save();
  return "admin";
}
