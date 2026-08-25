import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollToView } from "@/utils/scroll";

const scrollIntoViewMock = vi.fn();

beforeEach(() => {
  scrollIntoViewMock.mockClear();
  Element.prototype.scrollIntoView = scrollIntoViewMock;

  document.body.innerHTML = `
    <nav id="navbar"></nav>
    <section id="workflow"></section>
    <section id="projects"></section>
    <section id="contact"></section>
  `;
});

afterEach(() => {
  document.body.innerHTML = "";
  // @ts-expect-error test stub cleanup
  delete window.location;
});

describe("scrollToView", () => {
  it("smooth-scrolls to the section on the home route", () => {
    scrollToView("contact", "/");

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(scrollIntoViewMock.mock.instances[0]).toBe(
      document.getElementById("contact")
    );
  });

  it("treats a missing pathname as same-route navigation", () => {
    scrollToView("projects");

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("navigates to /#id when coming from another route", () => {
    // @ts-expect-error jsdom location stub
    window.location = { href: "http://localhost:3000/cv" };

    scrollToView("contact", "/cv");

    expect(window.location.href).toBe("/#contact");
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it("does nothing when the section id does not exist", () => {
    expect(() => scrollToView("does-not-exist", "/")).not.toThrow();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
