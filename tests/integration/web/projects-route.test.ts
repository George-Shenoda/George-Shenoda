import { describe, expect, it } from "vitest";
import { projects } from "@portfolio/shared";
import { GET } from "@/app/api/projects/route";

describe("GET /api/projects", () => {
  it("returns the shared projects list as JSON", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual(projects);
  });

  it("serves every project field needed by clients", async () => {
    const body = (await (await GET()).json()) as Array<Record<string, unknown>>;

    for (const project of body) {
      expect(Object.keys(project).sort()).toEqual([
        "id",
        "image",
        "link",
        "techstack",
        "title",
      ]);
      expect(Array.isArray(project.techstack)).toBe(true);
    }
  });
});
