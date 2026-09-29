import { SlidersHorizontal } from "lucide-react";
import type { ClarificationAnswer } from "../types/legal";

interface Question {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "injury",
    label: "Injury occurred?",
    options: [
      { value: "none", label: "No injury" },
      { value: "minor", label: "Minor injury" },
      { value: "serious", label: "Serious injury" },
    ],
  },
  {
    id: "weapon",
    label: "Weapon used?",
    options: [
      { value: "none", label: "No" },
      { value: "knife", label: "Knife" },
      { value: "gun", label: "Gun" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "accused_count",
    label: "Number of accused?",
    options: [
      { value: "one", label: "One" },
      { value: "multiple", label: "Multiple" },
    ],
  },
  {
    id: "victim_died",
    label: "Did the victim die?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "intent_to_kill",
    label: "Was killing allegedly intended?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Unknown" },
    ],
  },
];

interface ClarificationPanelProps {
  answers: ClarificationAnswer[];
  onChange: (answers: ClarificationAnswer[]) => void;
  relevantQuestionIds?: string[];
}

export default function ClarificationPanel({ answers, onChange, relevantQuestionIds }: ClarificationPanelProps) {
  const questions = relevantQuestionIds
    ? QUESTIONS.filter((q) => relevantQuestionIds.includes(q.id))
    : QUESTIONS;

  if (questions.length === 0) return null;

  function setAnswer(questionId: string, value: string) {
    const next = answers.filter((a) => a.questionId !== questionId);
    next.push({ questionId, value });
    onChange(next);
  }

  function valueFor(questionId: string): string | undefined {
    return answers.find((a) => a.questionId === questionId)?.value;
  }

  return (
    <section aria-labelledby="clarification-heading" className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
        <h2 id="clarification-heading" className="text-sm font-semibold text-navy-900 dark:text-white">
          Details that can improve the search
        </h2>
      </div>
      <p className="mb-4 text-xs text-navy-500 dark:text-navy-400">
        Optional. Answers only refine which provisions are ranked higher — they don't determine any outcome.
      </p>
      <div className="flex flex-col gap-4">
        {questions.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium text-navy-700 dark:text-navy-200">{q.label}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={q.label}>
              {q.options.map((opt) => {
                const selected = valueFor(q.id) === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAnswer(q.id, opt.value)}
                    className={`chip ${
                      selected ? "!border-saffron-500 !bg-saffron-100 !text-saffron-800 dark:!bg-saffron-500/20 dark:!text-saffron-300" : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
