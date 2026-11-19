import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OutlineView } from "./OutlineView";

const twoChapters = [
  { id: "c1", order: 0, title: "Where it began", objectives: "Explain the origins." },
  { id: "c2", order: 1, title: "Stoicism today", objectives: "Connect it to modern life." },
];

describe("OutlineView", () => {
  test("renders the title, summary and each chapter with a remove button", () => {
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary="A short course."
        initialChapters={twoChapters}
      />,
    );

    expect(screen.getByRole("heading", { name: "Stoicism" })).toBeInTheDocument();
    expect(screen.getByText("A short course.")).toBeInTheDocument();
    expect(screen.getByText("Where it began")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove chapter" })).toHaveLength(2);
  });

  test("hides the remove button once only one chapter remains", () => {
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary={null}
        initialChapters={[twoChapters[0]!]}
      />,
    );

    expect(screen.queryByRole("button", { name: "Remove chapter" })).not.toBeInTheDocument();
  });

  test("removing a chapter calls removeChapter and updates the list", async () => {
    const removeChapter = mock(async () => ({
      chapters: [{ id: "c2", order: 0, title: "Stoicism today", objectives: "Connect it to modern life." }],
    }));
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary={null}
        initialChapters={twoChapters}
        removeChapter={removeChapter}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Remove chapter" })[0]!);

    expect(removeChapter).toHaveBeenCalledWith("m1", "c1");
    expect(await screen.findByText("Stoicism today")).toBeInTheDocument();
    expect(screen.queryByText("Where it began")).not.toBeInTheDocument();
  });

  test("shows an error and keeps the chapters when removal fails", async () => {
    const removeChapter = mock(async () => ({ error: { code: "invalid_request", message: "A course needs at least one chapter." } }));
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary={null}
        initialChapters={twoChapters}
        removeChapter={removeChapter}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Remove chapter" })[0]!);

    expect(await screen.findByRole("alert")).toHaveTextContent("A course needs at least one chapter.");
    expect(screen.getByText("Where it began")).toBeInTheDocument();
  });

  test("regenerating replaces the title, summary and chapters", async () => {
    const regenerate = mock(async () => ({
      status: "regenerated" as const,
      title: "Stoicism, reimagined",
      summary: "A fresh take.",
      chapters: [{ id: "c9", order: 0, title: "A new beginning", objectives: "Start over." }],
    }));
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary="A short course."
        initialChapters={twoChapters}
        regenerate={regenerate}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Regenerate outline" }));

    expect(regenerate).toHaveBeenCalledWith("m1");
    expect(await screen.findByRole("heading", { name: "Stoicism, reimagined" })).toBeInTheDocument();
    expect(screen.getByText("A fresh take.")).toBeInTheDocument();
    expect(screen.getByText("A new beginning")).toBeInTheDocument();
  });

  test("shows an error when regeneration fails", async () => {
    const regenerate = mock(async () => ({ error: { code: "generation_failed", message: "Couldn't regenerate the outline. Try again." } }));
    render(
      <OutlineView
        moduleId="m1"
        initialTitle="Stoicism"
        initialSummary={null}
        initialChapters={twoChapters}
        regenerate={regenerate}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Regenerate outline" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't regenerate the outline");
  });
});
