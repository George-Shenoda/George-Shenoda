import { afterEach, describe, expect, it, vi } from "vitest";

const importSite = async () => await import("@/lib/site");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("site constants", () => {
  it("defaults to localhost when NEXT_PUBLIC_SITE_URL is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const site = await importSite();
    expect(site.SITE_URL).toBe("http://localhost:3000");
  });

  it("trims a trailing slash from NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://georgeshenoda.dev/");
    const site = await importSite();
    expect(site.SITE_URL).toBe("https://georgeshenoda.dev");
  });

  it("derives the title from the site name", async () => {
    const site = await importSite();
    expect(site.SITE_TITLE).toBe(
      `${site.SITE_NAME} | Full-Stack Developer`
    );
    expect(site.SITE_NAME).toBe("George Shenoda");
  });

  it("provides a non-empty description", async () => {
    const site = await importSite();
    expect(site.SITE_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
