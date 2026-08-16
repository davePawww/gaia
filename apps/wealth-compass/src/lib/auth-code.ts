export function resolveVerificationCode(
  routeCode: string | undefined,
  locationSearch: string,
): string {
  if (routeCode) return routeCode
  return new URLSearchParams(locationSearch).get("code") ?? ""
}
