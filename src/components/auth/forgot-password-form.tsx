"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
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

type ForgotPasswordFormProps = {
  context: "user" | "admin";
};

export function ForgotPasswordForm({ context }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isAdmin = context === "admin";
  const loginHref = isAdmin ? "/login?callbackUrl=/admin" : "/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, context }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Request fail ho gayi");
        setLoading(false);
        return;
      }

      setSent(true);
      setMessage(data.data.message);
      setLoading(false);
    } catch {
      setError("Kuch galat ho gaya");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">
            {isAdmin ? "Admin Password Reset" : "Password Bhool Gaye?"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Admin email daalo — reset link bhejenge"
              : "Apna email daalo — reset link bhejenge"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 rounded-md">
                {message}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Email check karo. Dev mode mein link server console par bhi dikhega agar SMTP configure nahi hai.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href={loginHref}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Login par wapas jao
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Bhej rahe hain..." : "Reset Link Bhejo"}
              </Button>
            </form>
          )}
          {!sent && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link href={loginHref} className="text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Login par wapas jao
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
