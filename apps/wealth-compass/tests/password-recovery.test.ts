import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildVerificationEmail,
  normalizeGmailAppPassword,
} from "../convex/emailContent.ts"

test("normalizes Gmail app passwords copied with spaces", () => {
  assert.equal(
    normalizeGmailAppPassword("abcd efgh ijkl mnop"),
    "abcdefghijklmnop",
  )
})

test("builds a password reset email with a safe link", () => {
  const email = buildVerificationEmail({
    kind: "password-reset",
    to: "person@example.com",
    from: "wealthcompass.sender@gmail.com",
    url: "https://example.com/reset-password?code=abc&x=1",
    expiresAt: Date.UTC(2026, 0, 1, 12),
  })

  assert.equal(email.to, "person@example.com")
  assert.equal(email.from, "wealthcompass.sender@gmail.com")
  assert.equal(email.subject, "Reset your Wealth Compass password")
  assert.match(email.text, /reset your password/)
  assert.match(email.html, /&amp;/)
  assert.match(email.html, /href="https:\/\/example\.com\/reset-password\?code=abc&amp;x=1"/)
})

test("builds a separate email-verification message", () => {
  const email = buildVerificationEmail({
    kind: "email-verification",
    to: "person@example.com",
    from: "wealthcompass.sender@gmail.com",
    url: "https://example.com/verify-email?code=abc",
    expiresAt: Date.UTC(2026, 0, 1, 12),
  })

  assert.equal(email.subject, "Verify your Wealth Compass email")
  assert.match(email.text, /verify your email/)
})
