import { describe, expect, it } from "vitest";
import { escapeHtml, stripCrlf } from "@/lib/sanitize";

describe("escapeHtml", () => {
  it("encodes all five dangerous characters", () => {
    expect(escapeHtml('&<>"\'')).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("neutralizes script injection", () => {
    const input = '<script>alert("x")</script>';
    const output = escapeHtml(input);
    expect(output).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(output).not.toContain("<script>");
  });

  it("does not break on ampersand-heavy input", () => {
    expect(escapeHtml("&&&")).toBe("&amp;&amp;&amp;");
  });

  it("leaves safe text untouched", () => {
    const safe = "Hello George — message 123!";
    expect(escapeHtml(safe)).toBe(safe);
  });

  it("handles empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });
});

describe("stripCrlf", () => {
  it("removes carriage returns and newlines", () => {
    expect(stripCrlf("line1\r\nline2\nline3\rline4")).toBe(
      "line1line2line3line4"
    );
  });

  it("keeps other whitespace intact", () => {
    expect(stripCrlf("a\tb c")).toBe("a\tb c");
  });

  it("handles header-injection payloads", () => {
    const payload = "Alice\r\nBcc: victim@example.com";
    expect(stripCrlf(payload)).not.toMatch(/[\r\n]/);
  });

  it("handles empty strings", () => {
    expect(stripCrlf("")).toBe("");
  });
});
