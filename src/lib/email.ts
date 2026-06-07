import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  context: "user" | "admin"
): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject =
    context === "admin"
      ? `${siteConfig.name} — Admin password reset`
      : `${siteConfig.name} — Password reset`;

  const html = `
    <p>Hello,</p>
    <p>We received a request to reset your ${context === "admin" ? "admin " : ""}password for ${siteConfig.name}.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    <p>— ${siteConfig.name}</p>
  `;

  const transporter = getTransporter();

  if (!transporter) {
    console.info("[password-reset] SMTP not configured. Reset link:", resetUrl);
    return process.env.NODE_ENV === "development";
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: `Reset your password: ${resetUrl}`,
  });

  return true;
}
