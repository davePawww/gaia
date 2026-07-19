import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { Button } from "@gaia/ui/components/button"
import { ArrowLeft, ChevronLeft, Sparkles } from "lucide-react"
import { Link } from "@tanstack/react-router"
import {
  QUESTIONS,
  type AnswerType,
  calculatePersonality,
} from "@wealth-compass/lib/questionnaire-data"
import { cn } from "@gaia/ui/lib/utils"

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Discover Your Money Personality
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Answer 12 quick questions about your relationship with money.
          We'll reveal your spending personality and show you exactly how
          to allocate your jars for maximum results.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li>Takes about 2 minutes</li>
          <li>No right or wrong answers</li>
          <li>Your result is personalized just for you</li>
        </ul>
        <Button size="lg" className="mt-8 w-full max-w-xs" onClick={onStart}>
          Start the Quiz
        </Button>
        <Link
          to="/"
          className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Maybe later
        </Link>
      </div>
    </div>
  )
}

function QuestionScreen({
  onBack,
}: {
  onBack: () => void
}) {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<AnswerType[]>([])

  const handleSelectAnswer = useCallback(
    (letter: AnswerType) => {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = letter
      setAnswers(newAnswers)
      ;(document.activeElement as HTMLElement)?.blur()

      setTimeout(() => {
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion((prev) => prev + 1)
        } else {
          const personality = calculatePersonality(newAnswers)
          localStorage.setItem("wealth-compass-personality", personality)
          navigate({ to: "/results" })
        }
      }, 300)
    },
    [answers, currentQuestion, navigate]
  )

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    } else {
      onBack()
    }
  }, [currentQuestion, onBack])

  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 border-b">
        <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {currentQuestion === 0 ? "Back" : "Previous"}
          </button>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question - centered, fills remaining space */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        <div className="w-full max-w-lg space-y-6">
          <h1 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {question.text}
          </h1>

          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = answers[currentQuestion] === option.letter
              return (
                <button
                  key={option.letter}
                  onClick={() => handleSelectAnswer(option.letter)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-all duration-200",
                    "hover:border-primary hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "active:scale-[0.98]",
                    isSelected
                      ? "border-primary bg-accent"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                      {option.letter}
                    </span>
                    <span className="text-sm leading-snug">
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuestionnairePage() {
  const [started, setStarted] = useState(false)

  if (!started) {
    return <IntroScreen onStart={() => setStarted(true)} />
  }

  return <QuestionScreen onBack={() => setStarted(false)} />
}

export const Route = createFileRoute("/_public/questionnaire")({
  component: QuestionnairePage,
})
