export type PersonalityType = "balanced" | "spender" | "saver" | "avoider"

export type AnswerType = "A" | "B" | "C" | "D"

export interface Question {
  id: number
  text: string
  options: {
    label: string
    letter: AnswerType
  }[]
  answerMap: Record<AnswerType, PersonalityType>
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When you receive unexpected money (bonus, gift), what's your first instinct?",
    options: [
      { letter: "A", label: "Spend it on something I've been wanting" },
      { letter: "B", label: "Save most of it, maybe treat myself a little" },
      { letter: "C", label: "Feel anxious about it, don't know what to do" },
      { letter: "D", label: "Split it up and put it toward different goals" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 2,
    text: "How do you feel about your current financial situation?",
    options: [
      { letter: "A", label: "I live comfortably and enjoy life" },
      { letter: "B", label: "I'm building wealth steadily, step by step" },
      { letter: "C", label: "I try not to think about it" },
      { letter: "D", label: "I have a plan and I'm following it" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 3,
    text: "What's your approach to budgeting?",
    options: [
      { letter: "A", label: "I don't really budget, I spend as needed" },
      { letter: "B", label: "I track every penny and stick to a strict budget" },
      { letter: "C", label: "I know I should budget but avoid looking at my finances" },
      { letter: "D", label: "I have a flexible budget that I review regularly" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 4,
    text: "When shopping, how do you make purchasing decisions?",
    options: [
      { letter: "A", label: "If I like it and can afford it, I buy it" },
      { letter: "B", label: "I comparison shop and wait for deals" },
      { letter: "C", label: "I feel guilty spending money, even on necessities" },
      { letter: "D", label: "I check my budget before making big purchases" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 5,
    text: "How do you feel about treating yourself or others?",
    options: [
      { letter: "A", label: "I love treating myself and others, it's how I show love" },
      { letter: "B", label: "I rarely splurge, but when I do, I feel guilty" },
      { letter: "C", label: "I feel uncomfortable spending on wants" },
      { letter: "D", label: "I set aside money specifically for fun and treats" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 6,
    text: "What's your biggest financial fear?",
    options: [
      { letter: "A", label: "Not being able to enjoy life" },
      { letter: "B", label: "Running out of money in retirement" },
      { letter: "C", label: "Everything - debt, bills, the unknown" },
      { letter: "D", label: "I don't have significant financial fears" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 7,
    text: "How often do you check your bank account?",
    options: [
      { letter: "A", label: "Only when I need to" },
      { letter: "B", label: "Daily or almost daily" },
      { letter: "C", label: "Rarely - it stresses me out" },
      { letter: "D", label: "Weekly as part of my financial review" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 8,
    text: "When a friend invites you to an expensive dinner, what do you do?",
    options: [
      { letter: "A", label: "Absolutely, I'm there!" },
      { letter: "B", label: "I suggest a cheaper alternative or decline" },
      { letter: "C", label: "I make up an excuse to avoid spending" },
      { letter: "D", label: "I go if it's in my budget, skip if not" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 9,
    text: "How do you approach major purchases (car, home, electronics)?",
    options: [
      { letter: "A", label: "I research but don't overthink - if it feels right, I buy" },
      { letter: "B", label: "I spend weeks/months researching and comparing" },
      { letter: "C", label: "I delay as long as possible, the process overwhelms me" },
      { letter: "D", label: "I plan ahead and save specifically for major purchases" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 10,
    text: "What's your relationship with credit cards?",
    options: [
      { letter: "A", label: "I use them freely and pay them off when I can" },
      { letter: "B", label: "I rarely use them, prefer debit or cash" },
      { letter: "C", label: "I avoid them or have maxed them out" },
      { letter: "D", label: "I use them strategically for rewards and pay in full monthly" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 11,
    text: "How would you describe your income?",
    options: [
      { letter: "A", label: "Good income, but it goes as fast as it comes" },
      { letter: "B", label: "Moderate income, but I save aggressively" },
      { letter: "C", label: "Variable or uncertain income" },
      { letter: "D", label: "Stable income with a clear allocation plan" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
  {
    id: 12,
    text: "When you think about retirement, what do you feel?",
    options: [
      { letter: "A", label: "I'll figure it out later, life is now" },
      { letter: "B", label: "I'm on track, I have a retirement plan" },
      { letter: "C", label: "Anxious - I know I should have started sooner" },
      { letter: "D", label: "Confident - I'm steadily building toward it" },
    ],
    answerMap: { A: "spender", B: "saver", C: "avoider", D: "balanced" },
  },
]

export const PERSONALITY_DESCRIPTIONS: Record<
  PersonalityType,
  { name: string; description: string }
> = {
  balanced: {
    name: "Balanced",
    description:
      "You take a balanced approach to money. You enjoy life today while building for tomorrow. The Money Jar System is designed for you - structured enough to build wealth, flexible enough to live.",
  },
  spender: {
    name: "Spender",
    description:
      "You live large and enjoy life! You're generous with yourself and others. The Money Jar System will help you maintain your lifestyle while building wealth - your PLAY jar is ready for you, and your FFA jar will grow quietly in the background.",
  },
  saver: {
    name: "Saver",
    description:
      "You're disciplined and future-focused. You plan ahead and save aggressively. The Money Jar System gives you structure and permission to enjoy your money through your PLAY jar, while your FFA jar accelerates your financial freedom.",
  },
  avoider: {
    name: "Avoider",
    description:
      "Money makes you anxious - and that's okay. The Money Jar System is designed to help you take control. We recommend starting with the Balanced approach. The simple structure removes the guesswork and builds confidence over time.",
  },
}

export function calculatePersonality(answers: AnswerType[]): PersonalityType {
  const counts: Record<PersonalityType, number> = {
    balanced: 0,
    spender: 0,
    saver: 0,
    avoider: 0,
  }

  answers.forEach((answer, index) => {
    const question = QUESTIONS[index]
    if (question) {
      const personality = question.answerMap[answer]
      if (personality) {
        counts[personality]++
      }
    }
  })

  // Find the highest count
  const maxCount = Math.max(...Object.values(counts))
  const topTypes = Object.entries(counts)
    .filter(([, count]) => count === maxCount)
    .map(([type]) => type as PersonalityType)

  // Avoider handling: if avoider is the top type, show Balanced with message
  if (topTypes.includes("avoider")) {
    return "avoider"
  }

  // Tie-breaking: if tie between spender/saver/balanced, default to balanced
  if (topTypes.length > 1) {
    if (topTypes.includes("balanced")) {
      return "balanced"
    }
    // If tie between spender and saver, default to balanced
    if (topTypes.includes("spender") && topTypes.includes("saver")) {
      return "balanced"
    }
    // If tie between spender and balanced
    if (topTypes.includes("spender") && topTypes.includes("balanced")) {
      return "balanced"
    }
    // If tie between saver and balanced
    if (topTypes.includes("saver") && topTypes.includes("balanced")) {
      return "balanced"
    }
  }

  return topTypes[0] ?? "balanced"
}
