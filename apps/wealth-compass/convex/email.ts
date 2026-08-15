"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import {
  buildVerificationEmail,
  normalizeGmailAppPassword,
} from "./emailContent";

export const sendVerificationEmail = internalAction({
  args: {
    identifier: v.string(),
    url: v.string(),
    expiresAt: v.number(),
    kind: v.union(
      v.literal("password-reset"),
      v.literal("email-verification"),
    ),
  },
  handler: async (_ctx, args) => {
    const smtpUser = process.env.GMAIL_SMTP_USER;
    const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD;
    const from = process.env.AUTH_EMAIL_FROM ?? smtpUser;

    if (!smtpUser || !appPassword || !from) {
      throw new Error(
        "Gmail SMTP email configuration is incomplete. Set GMAIL_SMTP_USER, GMAIL_SMTP_APP_PASSWORD, and AUTH_EMAIL_FROM.",
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: normalizeGmailAppPassword(appPassword),
      },
    });

    await transporter.sendMail(
      buildVerificationEmail({
        kind: args.kind,
        to: args.identifier,
        from,
        url: args.url,
        expiresAt: args.expiresAt,
      }),
    );
  },
});
