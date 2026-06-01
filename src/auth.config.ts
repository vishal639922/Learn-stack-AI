import type { NextAuthConfig } from "next-auth";
import { isAdminEmail } from "@/lib/admin-role";

/** Dev fallback so local login works when .env.local is missing. */
export function resolveAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "development") {
    return "learnstack-local-development-secret-min-32-chars";
  }
  return undefined;
}

export function isAuthConfigured(): boolean {
  return Boolean(resolveAuthSecret());
}

export const authConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email ?? undefined;
        token.role = user.role || "user";
        token.isPremium = user.isPremium || false;
      }

      if (token.email && isAdminEmail(token.email as string)) {
        token.role = "admin";
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isPremium = token.isPremium as boolean;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
