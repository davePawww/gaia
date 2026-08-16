export function resolveVerificationCode(
  routeCode: string | undefined,
  locationSearch: string,
  locationHash = "",
): string {
  if (routeCode) return routeCode
  const searchCode = new URLSearchParams(locationSearch).get("code")
  if (searchCode) return searchCode
  return new URLSearchParams(locationHash.replace(/^#/, "")).get("code") ?? ""
}
