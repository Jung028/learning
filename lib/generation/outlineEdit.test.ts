import { describe, expect, test } from "bun:test";
import { canEditOutline, canRemoveChapter } from "./outlineEdit";

describe("canEditOutline", () => {
  test("allows editing while the module is outlining", () => {
    expect(canEditOutline("outlining")).toEqual({ ok: true });
  });

  test("refuses editing once the module has moved past outlining", () => {
    expect(canEditOutline("generating")).toEqual({
      ok: false,
      reason: "This module's outline can no longer be edited.",
    });
  });
});

describe("canRemoveChapter", () => {
  test("allows removing a chapter when more than one remains", () => {
    expect(canRemoveChapter("outlining", 3)).toEqual({ ok: true });
  });

  test("refuses removing the last chapter", () => {
    expect(canRemoveChapter("outlining", 1)).toEqual({
      ok: false,
      reason: "A course needs at least one chapter.",
    });
  });

  test("refuses removing a chapter once the module has moved past outlining", () => {
    expect(canRemoveChapter("generating", 3)).toEqual({
      ok: false,
      reason: "This module's outline can no longer be edited.",
    });
  });
});
