"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Galat email ya password",
  Configuration:
    "Server par login configure nahi hai. .env.local mein AUTH_SECRET add karo aur npm run dev restart karo.",
};
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "success";
  const isAdminLogin = callbackUrl.includes("/admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlError) {
      setError(
        AUTH_ERROR_MESSAGES[urlError] ??
          "Sign in fail ho gaya. Email aur password check karo."
      );
    }
  }, [urlError]);

  const forgotPasswordHref = isAdminLogin
    ? "/admin/forgot-password"
    : "/forgot-password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        AUTH_ERROR_MESSAGES[result.error] ??
          "Galat email ya password"
      );
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    setError("Sign in fail ho gaya. Phir se try karo.");
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Wapas Aao</CardTitle>
          <CardDescription>Apne account mein sign in karo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {resetSuccess && (
              <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 rounded-md">
                Password update ho gaya. Ab sign in karo.
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href={forgotPasswordHref}
                  className="text-xs text-primary hover:underline"
                >
                  Password bhool gaye?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sign in ho raha hai..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Account nahi hai?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up karo
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
