import { afterEach, describe, expect, it, vi } from "vitest";

const importConfig = async () => await import("@mobile/config");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SITE_URL", () => {
  it("defaults to production URL without EXPO_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("EXPO_PUBLIC_SITE_URL", "");
    const config = await importConfig();
    expect(config.SITE_URL).toBe("https://george-shenoda.vercel.app");
  });

  it("strips a trailing slash from EXPO_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("EXPO_PUBLIC_SITE_URL", "https://georgeshenoda.dev/");
    const config = await importConfig();
    expect(config.SITE_URL).toBe("https://georgeshenoda.dev");
  });
});

describe("resolveAssetUrl", () => {
  it("passes absolute http(s) URLs through untouched", async () => {
    const config = await importConfig();
    expect(config.resolveAssetUrl("http://cdn.example.com/a.png")).toBe(
      "http://cdn.example.com/a.png"
    );
    expect(config.resolveAssetUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png"
    );
    expect(config.resolveAssetUrl("HTTPS://CDN.EXAMPLE.COM/A.PNG")).toBe(
      "HTTPS://CDN.EXAMPLE.COM/A.PNG"
    );
  });

  it("prefixes relative paths with SITE_URL", async () => {
    vi.stubEnv("EXPO_PUBLIC_SITE_URL", "https://georgeshenoda.dev");
    const config = await importConfig();
    expect(config.resolveAssetUrl("/assets/projects/iot.png")).toBe(
      "https://georgeshenoda.dev/assets/projects/iot.png"
    );
  });
});
