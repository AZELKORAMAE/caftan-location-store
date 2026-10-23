import "server-only";
import nodemailer from "nodemailer";

/** Envoi via le SMTP Gmail de la boutique (mot de passe d'application Google). */
export function isMailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const user = process.env.SMTP_USER!;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass: process.env.SMTP_PASS!.replace(/\s/g, "") },
  });
  await transporter.sendMail({
    from: { name: process.env.MAIL_FROM_NAME || "Dar Lalla", address: user },
    replyTo: user,
    to,
    subject,
    html,
    text,
  });
}
