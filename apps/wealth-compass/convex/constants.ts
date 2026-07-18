export const DEFAULT_JARS = [
  { name: "NEC", fullName: "Necessities", color: "#EF4444", percentage: 55, icon: "Home" },
  { name: "FFA", fullName: "Financial Freedom", color: "#F59E0B", percentage: 10, icon: "TrendingUp" },
  { name: "LTSS", fullName: "Long-Term Savings", color: "#3B82F6", percentage: 10, icon: "Shield" },
  { name: "EDU", fullName: "Education", color: "#EAB308", percentage: 10, icon: "BookOpen" },
  { name: "PLAY", fullName: "Play", color: "#A855F7", percentage: 10, icon: "Gamepad2" },
  { name: "GIVE", fullName: "Giving", color: "#22C55E", percentage: 5, icon: "Heart" },
]

export const PERSONALITY_PRESETS = [
  {
    name: "Balanced",
    description: "Official T. Harv Eker allocation",
    percentages: { NEC: 55, FFA: 10, LTSS: 10, EDU: 10, PLAY: 10, GIVE: 5 },
  },
  {
    name: "Spender",
    description: "Higher Financial Freedom, more security-focused",
    percentages: { NEC: 55, FFA: 15, LTSS: 10, EDU: 10, PLAY: 5, GIVE: 5 },
  },
  {
    name: "Saver",
    description: "Lower necessities, more for savings and play",
    percentages: { NEC: 45, FFA: 15, LTSS: 10, EDU: 10, PLAY: 15, GIVE: 5 },
  },
] as const

export type PersonalityPresetName = (typeof PERSONALITY_PRESETS)[number]["name"]

export const JAR_FULL_NAMES: Record<string, string> = Object.fromEntries(
  DEFAULT_JARS.map((jar) => [jar.name, jar.fullName])
)
