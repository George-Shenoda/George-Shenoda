import { describe, expect, it } from "vitest";
import { validateProject, PROJECT_ID_PATTERN } from "@/lib/admin/validate";

const validPayload = {
  id: "my-project",
  title: "My Project",
  link: "https://example.com",
  image: "/assets/projects/my-project.png",
  techstack: ["Next.js", "TypeScript"],
};

describe("validateProject", () => {
  it("accepts a valid project and trims string fields", () => {
    const result = validateProject({
      ...validPayload,
      id: "  my-project  ",
      title: "  My Project ",
      techstack: [" Next.js ", "TypeScript"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("my-project");
      expect(result.value.techstack).toEqual(["Next.js", "TypeScript"]);
    }
  });

  it("rejects non-object payloads", () => {
    for (const payload of [null, undefined, "x", 42, []]) {
      expect(validateProject(payload).ok).toBe(false);
    }
  });

  it("rejects an invalid id", () => {
    for (const id of ["UPPERCASE", "has space", "trailing-", "-leading", "under_score"]) {
      expect(validateProject({ ...validPayload, id }).ok, `id=${id}`).toBe(false);
      expect(PROJECT_ID_PATTERN.test(id)).toBe(false);
    }
    expect(validateProject({ ...validPayload, id: "a".repeat(101) }).ok).toBe(false);
  });

  it("accepts a slug-shaped id", () => {
    expect(validateProject({ ...validPayload, id: "gvmt-admin" }).ok).toBe(true);
    expect(validateProject({ ...validPayload, id: "a1-b2-c3" }).ok).toBe(true);
  });

  it("rejects missing or empty required fields", () => {
    for (const field of ["id", "title", "link", "image"]) {
      expect(
        validateProject({ ...validPayload, [field]: "" }).ok,
        `${field} empty`
      ).toBe(false);
      expect(
        validateProject({ ...validPayload, [field]: undefined }).ok,
        `${field} missing`
      ).toBe(false);
    }
  });

  it("rejects oversize fields", () => {
    expect(validateProject({ ...validPayload, title: "a".repeat(121) }).ok).toBe(false);
    expect(validateProject({ ...validPayload, link: `https://x.com/${"a".repeat(500)}` }).ok).toBe(false);
    expect(validateProject({ ...validPayload, techstack: ["a".repeat(41)] }).ok).toBe(false);
    expect(validateProject({ ...validPayload, techstack: Array(21).fill("x") }).ok).toBe(false);
  });

  it("rejects a bad link", () => {
    for (const link of ["javascript:alert(1)", "ftp://x.com", "not-a-url", "//x.com"]) {
      expect(validateProject({ ...validPayload, link }).ok, `link=${link}`).toBe(false);
    }
  });

  it("accepts an http link", () => {
    expect(validateProject({ ...validPayload, link: "http://localhost:3000" }).ok).toBe(true);
  });

  it("rejects an image that is not a site-relative path", () => {
    for (const image of ["https://cdn.example.com/x.png", "assets/x.png", "//evil.com/x.png", "javascript:alert(1)"]) {
      expect(validateProject({ ...validPayload, image }).ok, `image=${image}`).toBe(false);
    }
  });

  it("rejects a non-array techstack", () => {
    expect(validateProject({ ...validPayload, techstack: "Next.js" }).ok).toBe(false);
    expect(validateProject({ ...validPayload, techstack: [1, 2] }).ok).toBe(false);
  });
});