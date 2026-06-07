"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { McqBlockAttrs } from "./extensions/mcq-block";

interface McqQuizProps {
  attrs: McqBlockAttrs;
}

export function McqQuiz({ attrs }: McqQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const options = Array.isArray(attrs.options) ? attrs.options.filter(Boolean) : [];

  const isCorrect = selected === attrs.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="mcq-quiz my-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
        <HelpCircle className="h-5 w-5" />
        Practice Question
      </div>

      <p className="font-medium text-foreground mb-4 leading-relaxed">{attrs.question}</p>

      <div className="space-y-2 mb-4">
        {options.map((option, index) => {
          let optionClass =
            "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ";

          if (!submitted) {
            optionClass +=
              selected === index
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50";
          } else if (index === attrs.correctIndex) {
            optionClass += "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
          } else if (index === selected) {
            optionClass += "border-destructive bg-destructive/10 text-destructive";
          } else {
            optionClass += "border-border opacity-60";
          }

          return (
            <button
              key={index}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(index)}
              className={optionClass}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <Button type="button" onClick={handleSubmit} disabled={selected === null} size="sm">
          Answer Check Karo
        </Button>
      ) : (
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 text-sm font-medium ${
              isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Sahi jawab!
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" /> Galat jawab. Sahi answer:{" "}
                {String.fromCharCode(65 + attrs.correctIndex)}. {options[attrs.correctIndex]}
              </>
            )}
          </div>
          {attrs.explanation && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <strong>Explanation:</strong> {attrs.explanation}
            </p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            Phir se try karo
          </Button>
        </div>
      )}
    </div>
  );
}
