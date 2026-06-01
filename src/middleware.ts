import NextAuth from "next-auth";
import { authConfig, resolveAuthSecret } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth({
  ...authConfig,
  secret: resolveAuthSecret(),
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    }
    if (role !== "admin" && role !== "editor") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/dashboard", req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
