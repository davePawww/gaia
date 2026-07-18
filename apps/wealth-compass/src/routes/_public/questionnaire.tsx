import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { Button } from "@gaia/ui/components/button"
import { ArrowLeft, ChevronLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"
import {
  QUESTIONS,
  type AnswerType,
  calculatePersonality,
} from "@wealth-compass/lib/questionnaire-data"
import { cn } from "@gaia/ui/lib/utils"

function QuestionnairePage() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<AnswerType[]>([])

  const handleSelectAnswer = useCallback(
    (letter: AnswerType) => {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = letter
      setAnswers(newAnswers)

      // Auto-advance after selection
      setTimeout(() => {
        if (currentQuestion < QUESTIONS.length - 1) {
          setCurrentQuestion((prev) => prev + 1)
        } else {
          // Calculate personality and navigate to results
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
    }
  }, [currentQuestion])

  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {question.text}
          </h1>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[currentQuestion] === option.letter
              return (
                <button
                  key={option.letter}
                  onClick={() => handleSelectAnswer(option.letter)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-all duration-200",
                    "hover:border-primary hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "active:scale-[0.98]",
                    isSelected
                      ? "border-primary bg-accent"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium">
                      {option.letter}
                    </span>
                    <span className="text-sm font-medium leading-relaxed sm:text-base">
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Back button */}
          {currentQuestion > 0 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_public/questionnaire")({
  component: QuestionnairePage,
})
