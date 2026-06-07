import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      isPremium: boolean;
    };
  }

  interface User {
    role?: string;
    isPremium?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isPremium?: boolean;
  }
}

export {};
