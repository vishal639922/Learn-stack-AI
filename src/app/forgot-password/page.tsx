import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { generateSEO } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Forgot Password",
  description: `${siteConfig.name} account ka password reset karo.`,
  slug: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm context="user" />;
}
