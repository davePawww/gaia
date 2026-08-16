import assert from "node:assert/strict"
import { test } from "node:test"
import { resolveVerificationCode } from "../src/lib/auth-code.ts"

test("uses the router verification code when available", () => {
  assert.equal(resolveVerificationCode("router-code", "?code=url-code"), "router-code")
})

test("falls back to the browser URL when the router search is empty", () => {
  assert.equal(resolveVerificationCode(undefined, "?code=url-code"), "url-code")
})

test("returns an empty code when neither source contains one", () => {
  assert.equal(resolveVerificationCode(undefined, "?other=value"), "")
})
