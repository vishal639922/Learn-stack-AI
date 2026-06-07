"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const context = searchParams.get("context") === "admin" ? "admin" : "user";
  const loginHref =
    context === "admin" ? "/login?callbackUrl=/admin" : "/login";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset link invalid hai. Naya link maango.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password match nahi kar rahe");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Password reset fail ho gaya");
        setLoading(false);
        return;
      }

      router.push(
        loginHref.includes("?")
          ? `${loginHref}&reset=success`
          : `${loginHref}?reset=success`
      );
    } catch {
      setError("Kuch galat ho gaya");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              Ye reset link valid nahi hai. Naya link maango.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/forgot-password">User reset link maango</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/forgot-password">Admin reset link maango</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Naya Password Set Karo</CardTitle>
          <CardDescription>Strong password choose karo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Naya Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Kam se kam 8 characters, ek uppercase letter aur ek number chahiye
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Password Dobara</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Update ho raha hai..." : "Password Update Karo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
