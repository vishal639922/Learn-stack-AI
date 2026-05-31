import RegisterForm from "./register-form";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Register",
  description: "Create your LearnStack AI account.",
  slug: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
