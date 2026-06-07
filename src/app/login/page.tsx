import { Suspense } from "react";
import LoginForm from "./login-form";
import { generateSEO } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Login",
  description: `Apne ${siteConfig.name} account mein sign in karo.`,
  slug: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Load ho raha hai...</div>}>
      <LoginForm />
    </Suspense>
  );
}
