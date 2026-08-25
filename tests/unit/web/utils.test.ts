import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", null, undefined, true && "c")).toBe("a c");
  });

  it("resolves conflicting tailwind classes last-wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("merges conditional objects and arrays", () => {
    expect(cn({ hidden: false, visible: true }, ["p-2"])).toBe("visible p-2");
  });

  it("returns an empty string with no input", () => {
    expect(cn()).toBe("");
  });
});
