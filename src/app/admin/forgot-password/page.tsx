import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { generateSEO } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Admin Forgot Password",
  description: `${siteConfig.name} admin account ka password reset karo.`,
  slug: "/admin/forgot-password",
  noIndex: true,
});

export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm context="admin" />;
}
