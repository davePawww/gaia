export type VerificationEmailKind =
  | "password-reset"
  | "email-verification"

export function normalizeGmailAppPassword(value: string) {
  return value.replace(/\s/g, "")
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function buildVerificationEmail({
  kind,
  to,
  from,
  url,
  expiresAt,
}: {
  kind: VerificationEmailKind
  to: string
  from: string
  url: string
  expiresAt: number
}) {
  const isPasswordReset = kind === "password-reset"
  const subject = isPasswordReset
    ? "Reset your Wealth Compass password"
    : "Verify your Wealth Compass email"
  const action = isPasswordReset ? "reset your password" : "verify your email"
  const safeUrl = escapeHtml(url)
  const expires = new Date(expiresAt).toUTCString()

  return {
    from,
    to,
    subject,
    text: `Wealth Compass\n\nUse this link to ${action}: ${url}\n\nThis link expires at ${expires}. If you did not request this, you can ignore this email.`,
    html: `<p>Use the link below to ${action} for Wealth Compass:</p><p><a href="${safeUrl}">${safeUrl}</a></p><p>This link expires at ${escapeHtml(expires)}. If you did not request this, you can ignore this email.</p>`,
  }
}
