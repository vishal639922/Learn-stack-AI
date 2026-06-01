import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { ensureAdminRole, isAdminEmail } from "@/lib/admin-role";
import { resolveAuthSecret } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: resolveAuthSecret(),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email }).select(
          "+password"
        );
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        if (!isValid) return null;

        const role = await ensureAdminRole(user);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role,
          image: user.avatar,
          isPremium: user.isPremium,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;

      await connectDB();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name || "User",
          email: user.email,
          avatar: user.image ?? undefined,
          role: isAdminEmail(user.email) ? "admin" : "user",
        });
      } else {
        await ensureAdminRole(existingUser);
      }
      return true;
    },
  },
});
