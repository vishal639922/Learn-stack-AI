import type { NextAuthConfig } from "next-auth";

/** Dev fallback so local login works when .env.local is missing. */
export function resolveAuthSecret(): string | undefined {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "development") {
    return "learnstack-local-development-secret-min-32-chars";
  }
  return undefined;
}

/** Local dev must use localhost or CSRF/login POST to production AUTH_URL fails. */
export function resolveAuthUrl(): string | undefined {
  const envUrl = process.env.AUTH_URL?.trim();
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "3000";
    if (envUrl?.includes("localhost") || envUrl?.includes("127.0.0.1")) {
      return envUrl;
    }
    return `http://localhost:${port}`;
  }
  return envUrl;
}

const resolvedAuthUrl = resolveAuthUrl();
if (resolvedAuthUrl) {
  process.env.AUTH_URL = resolvedAuthUrl;
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
