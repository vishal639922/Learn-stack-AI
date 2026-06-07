import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { generateSEO } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Reset Password",
  description: `${siteConfig.name} ka naya password set karo.`,
  slug: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          Load ho raha hai...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
