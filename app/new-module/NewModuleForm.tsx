"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { LEVELS, type Level } from "@/lib/generation/level";
import type { ModuleLength } from "@/lib/generation/length";

const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const LENGTH_OPTIONS: { value: ModuleLength; label: string }[] = [
  { value: "short", label: "3 chapters" },
  { value: "medium", label: "5 chapters" },
  { value: "long", label: "8 chapters" },
];

export type CreateModuleResponse =
  | { status: "refused"; reason: string }
  | { status: "created"; moduleId: string }
  | { error: { code: string; message: string } };

export type SubmitCreateModule = (input: {
  topic: string;
  level: Level;
  length: ModuleLength;
}) => Promise<CreateModuleResponse>;

async function defaultSubmitCreateModule(input: {
  topic: string;
  level: Level;
  length: ModuleLength;
}): Promise<CreateModuleResponse> {
  const response = await fetch("/api/modules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.json();
}

interface NewModuleFormProps {
  submitCreateModule?: SubmitCreateModule;
  navigate?: (path: string) => void;
}

// Plain navigation, not next/navigation's useRouter — this form has no App
// Router context in tests, and a full load into the Outline page is fine
// right after creating a module (not a performance-sensitive hop).
function defaultNavigate(path: string): void {
  window.location.href = path;
}

export function NewModuleForm({ submitCreateModule = defaultSubmitCreateModule, navigate = defaultNavigate }: NewModuleFormProps) {
  const go = navigate;

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [length, setLength] = useState<ModuleLength>("short");
  const [phase, setPhase] = useState<"form" | "generating">("form");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    setError(null);
    setPhase("generating");

    try {
      const result = await submitCreateModule({ topic: trimmedTopic, level, length });

      if ("error" in result) {
        setError(result.error.message);
        setPhase("form");
        return;
      }
      if (result.status === "refused") {
        setError(result.reason);
        setPhase("form");
        return;
      }
      go(`/modules/${result.moduleId}/outline`);
    } catch {
      setError("Something went wrong. Try again.");
      setPhase("form");
    }
  }

  if (phase === "generating") {
    const lengthLabel = LENGTH_OPTIONS.find((o) => o.value === length)?.label;
    return (
      <div role="status" className="flex flex-col gap-2">
        <p className="m-0 text-lg font-semibold">Writing your outline…</p>
        <p className="m-0 text-sm text-muted">
          Topic: {topic.trim()} · {LEVEL_LABELS[level]} · {lengthLabel}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className="text-sm font-semibold">
          Topic
        </label>
        <textarea
          id="topic"
          rows={3}
          maxLength={200}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="box-border w-full resize-none rounded-card border border-crema bg-foam p-4 font-sans text-lg text-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">Your level</div>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <Chip key={l} label={LEVEL_LABELS[l]} selected={level === l} onClick={() => setLevel(l)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">How many chapters</div>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={length === option.value}
              onClick={() => setLength(option.value)}
            />
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-cherry">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary">
        Generate outline
      </Button>
    </form>
  );
}
