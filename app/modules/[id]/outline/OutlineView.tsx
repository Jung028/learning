"use client";

import { useState } from "react";
import { Button, IconButton } from "@/components/ui/Button";

export type OutlineChapter = { id: string; order: number; title: string; objectives?: string | null };

type ApiError = { error: { code: string; message: string } };

export type RemoveChapterResponse = { chapters: OutlineChapter[] } | ApiError;
export type RegenerateResponse =
  | { status: "regenerated"; title: string; summary: string; chapters: OutlineChapter[] }
  | ApiError;

export type RemoveChapter = (moduleId: string, chapterId: string) => Promise<RemoveChapterResponse>;
export type Regenerate = (moduleId: string) => Promise<RegenerateResponse>;

async function defaultRemoveChapter(moduleId: string, chapterId: string): Promise<RemoveChapterResponse> {
  const response = await fetch(`/api/modules/${moduleId}/chapters/${chapterId}`, { method: "DELETE" });
  return response.json();
}

async function defaultRegenerate(moduleId: string): Promise<RegenerateResponse> {
  const response = await fetch(`/api/modules/${moduleId}/regenerate`, { method: "POST" });
  return response.json();
}

interface OutlineViewProps {
  moduleId: string;
  initialTitle: string;
  initialSummary: string | null;
  initialChapters: OutlineChapter[];
  removeChapter?: RemoveChapter;
  regenerate?: Regenerate;
}

/**
 * FR-2: remove a chapter or regenerate the whole outline. "Start chapter 1"
 * (design/Outline.dc.html) isn't here yet — it needs chapter/card
 * generation (T-024), not built.
 */
export function OutlineView({
  moduleId,
  initialTitle,
  initialSummary,
  initialChapters,
  removeChapter = defaultRemoveChapter,
  regenerate = defaultRegenerate,
}: OutlineViewProps) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [chapters, setChapters] = useState(initialChapters);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(chapterId: string) {
    setError(null);
    setBusy(true);
    const result = await removeChapter(moduleId, chapterId);
    setBusy(false);

    if ("error" in result) {
      setError(result.error.message);
      return;
    }
    setChapters(result.chapters);
  }

  async function handleRegenerate() {
    setError(null);
    setBusy(true);
    const result = await regenerate(moduleId);
    setBusy(false);

    if ("error" in result) {
      setError(result.error.message);
      return;
    }
    setTitle(result.title);
    setSummary(result.summary);
    setChapters(result.chapters);
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display font-bold text-[32px] leading-[38px]">{title}</h1>
        {summary && <p className="m-0 text-base leading-6 text-muted">{summary}</p>}
      </div>

      {error && (
        <p role="alert" className="m-0 text-sm text-cherry">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {chapters.map((chapter, i) => (
          <div key={chapter.id} className="flex items-center gap-3 rounded-card border border-crema bg-foam p-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-pill bg-cappuccino text-sm font-semibold text-ink-hover">
              {i + 1}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="text-base font-semibold leading-[22px]">{chapter.title}</div>
              {chapter.objectives && <div className="text-[13px] text-muted">{chapter.objectives}</div>}
            </div>
            {chapters.length > 1 && (
              <IconButton
                label="Remove chapter"
                onClick={() => handleRemove(chapter.id)}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                }
              />
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={handleRegenerate} disabled={busy}>
        Regenerate outline
      </Button>
    </>
  );
}
