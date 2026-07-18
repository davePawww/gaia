export const DEFAULT_JARS = [
  { name: "NEC", fullName: "Necessities", color: "#EF4444", percentage: 55, icon: "Home" },
  { name: "LTSS", fullName: "Long-Term Savings", color: "#3B82F6", percentage: 10, icon: "Shield" },
  { name: "EDU", fullName: "Education", color: "#EAB308", percentage: 10, icon: "BookOpen" },
  { name: "PLAY", fullName: "Play", color: "#A855F7", percentage: 10, icon: "Gamepad2" },
  { name: "GIVE", fullName: "Giving", color: "#22C55E", percentage: 10, icon: "Heart" },
  { name: "FFA", fullName: "Financial Freedom", color: "#F59E0B", percentage: 5, icon: "TrendingUp" },
]

export const JAR_FULL_NAMES: Record<string, string> = Object.fromEntries(
  DEFAULT_JARS.map((jar) => [jar.name, jar.fullName])
)
