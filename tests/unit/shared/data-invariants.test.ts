import { describe, expect, it } from "vitest";
import { cv, projects, theme } from "@portfolio/shared";

const HTTPS_URL = /^https:\/\/[^\s]+$/;
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

describe("projects data invariants", () => {
  it("has a non-empty list with unique ids", () => {
    expect(projects.length).toBeGreaterThan(0);
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses valid https links", () => {
    for (const project of projects) {
      expect(project.link, `${project.id} link`).toMatch(HTTPS_URL);
    }
  });

  it("points images at local project assets", () => {
    for (const project of projects) {
      expect(project.image, `${project.id} image`).toMatch(
        /^\/assets\/projects\/.+\.png$/
      );
    }
  });

  it("always declares a tech stack", () => {
    for (const project of projects) {
      expect(project.techstack.length, `${project.id} techstack`).toBeGreaterThan(0);
    }
  });
});

describe("cv data invariants", () => {
  it("has a complete profile with a valid email", () => {
    expect(cv.profile.name.trim()).not.toBe("");
    expect(cv.profile.headline.trim()).not.toBe("");
    expect(cv.profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("links are https and labelled", () => {
    expect(cv.links.length).toBeGreaterThan(0);
    for (const link of cv.links) {
      expect(link.label.trim()).not.toBe("");
      expect(link.href).toMatch(HTTPS_URL);
    }
  });

  it("populates every resume section", () => {
    expect(cv.summary.length).toBeGreaterThan(0);
    expect(cv.experience.length).toBeGreaterThan(0);
    expect(cv.education.length).toBeGreaterThan(0);
    expect(cv.projects.length).toBeGreaterThan(0);
    expect(cv.skillGroups.length).toBeGreaterThan(0);
    expect(cv.certifications.length).toBeGreaterThan(0);
    expect(cv.languages.length).toBeGreaterThan(0);
  });

  it("experience entries carry role, company and highlights", () => {
    for (const job of cv.experience) {
      expect(job.role.trim()).not.toBe("");
      expect(job.company.trim()).not.toBe("");
      expect(job.period.trim()).not.toBe("");
      expect(job.highlights.length).toBeGreaterThan(0);
    }
  });

  it("cv project ids are unique and described", () => {
    const ids = cv.projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const project of cv.projects) {
      expect(project.description.trim()).not.toBe("");
      expect(project.techstack.length).toBeGreaterThan(0);
    }
  });

  it("skill groups have labels and items", () => {
    for (const group of cv.skillGroups) {
      expect(group.label.trim()).not.toBe("");
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("languages are unique", () => {
    const names = cv.languages.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("theme tokens", () => {
  it("colors are hex values", () => {
    for (const [name, value] of Object.entries(theme.colors)) {
      expect(value, `theme.colors.${name}`).toMatch(HEX_COLOR);
    }
  });

  it("declares sans and mono fonts", () => {
    expect(theme.fonts.sans.trim()).not.toBe("");
    expect(theme.fonts.mono.trim()).not.toBe("");
  });
});
