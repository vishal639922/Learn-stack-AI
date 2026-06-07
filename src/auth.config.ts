import type { NextAuthConfig } from "next-auth";

/** Dev fallback so local login works when .env.local is missing. */
export function resolveAuthSecret(): string | undefined {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "development") {
    return "learnstack-local-development-secret-min-32-chars";
  }
  return undefined;
}


export function isAuthConfigured(): boolean {
  return Boolean(resolveAuthSecret());
}



export const authConfig = {
  secret: resolveAuthSecret(),
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
        token.role = user.role || "user";
        token.isPremium = user.isPremium || false;
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
