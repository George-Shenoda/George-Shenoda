import { describe, expect, it } from "vitest";
import * as shared from "@portfolio/shared";

describe("@portfolio/shared public API surface", () => {
  it("exports the projects data and type", () => {
    expect(Array.isArray(shared.projects)).toBe(true);
    expect(shared.projects.length).toBeGreaterThan(0);
  });

  it("exports the theme", () => {
    expect(typeof shared.theme).toBe("object");
    expect(shared.theme.colors.primary).toMatch(/^#/);
  });

  it("exports the contact client", () => {
    expect(typeof shared.submitContact).toBe("function");
  });

  it("exports the outbox factory and storage adapters", () => {
    expect(typeof shared.createOutbox).toBe("function");
    expect(typeof shared.createLocalStorageStorage).toBe("function");
  });

  it("exports the cv data", () => {
    expect(typeof shared.cv).toBe("object");
    expect(shared.cv.profile.name.trim()).not.toBe("");
  });
});
