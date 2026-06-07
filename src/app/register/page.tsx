import RegisterForm from "./register-form";
import { generateSEO } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = generateSEO({
  title: "Register",
  description: `Apna ${siteConfig.name} account banao.`,
  slug: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
