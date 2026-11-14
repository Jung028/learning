import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { expect } from "bun:test";

declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging to add Testing Library matchers to Bun's `expect`
  interface Matchers<T>
    extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      T
    > {}
}
