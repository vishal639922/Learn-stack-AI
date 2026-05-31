import { Suspense } from "react";
import LoginForm from "./login-form";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Login",
  description: "Sign in to your LearnStack AI account.",
  slug: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
