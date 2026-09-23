import type { Project } from "@portfolio/shared";

export const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MAX_ID_LENGTH = 100;
const MAX_TITLE_LENGTH = 120;
const MAX_TECHSTACK_ITEMS = 20;
const MAX_TECH_ITEM_LENGTH = 40;
const MAX_URL_LENGTH = 500;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export type ValidateResult =
  | { ok: true; value: Project }
  | { ok: false; error: string };

export function validateProject(input: unknown): ValidateResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Project payload must be an object." };
  }

  const { id, title, techstack, link, image } = input as Record<string, unknown>;

  if (!isNonEmptyString(id) || id.trim().length > MAX_ID_LENGTH) {
    return { ok: false, error: "id is required and must be 100 characters or fewer." };
  }
  const cleanId = id.trim();
  if (!PROJECT_ID_PATTERN.test(cleanId)) {
    return { ok: false, error: "id must be lowercase letters, numbers, and dashes only." };
  }

  if (!isNonEmptyString(title) || title.trim().length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `title is required and must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  const cleanTitle = title.trim();

  if (!Array.isArray(techstack)) {
    return { ok: false, error: "techstack must be an array of strings." };
  }
  if (techstack.length === 0 || techstack.length > MAX_TECHSTACK_ITEMS) {
    return { ok: false, error: `techstack must contain 1 to ${MAX_TECHSTACK_ITEMS} technologies.` };
  }
  const cleanTechstack: string[] = [];
  for (const item of techstack) {
    if (!isNonEmptyString(item) || item.trim().length > MAX_TECH_ITEM_LENGTH) {
      return { ok: false, error: `Each technology must be a non-empty string of ${MAX_TECH_ITEM_LENGTH} characters or fewer.` };
    }
    cleanTechstack.push(item.trim());
  }

  if (!isNonEmptyString(link) || link.trim().length > MAX_URL_LENGTH) {
    return { ok: false, error: "link is required and must be 500 characters or fewer." };
  }
  const cleanLink = link.trim();
  if (!/^https?:\/\/.+/i.test(cleanLink)) {
    return { ok: false, error: "link must be a valid http(s) URL." };
  }

  if (!isNonEmptyString(image) || image.trim().length > MAX_URL_LENGTH) {
    return { ok: false, error: "image is required and must be 500 characters or fewer." };
  }
  const cleanImage = image.trim();
  if (!/^\/(?!\/)[^\s]+$/.test(cleanImage)) {
    return { ok: false, error: "image must be a site-relative path starting with /." };
  }

  return {
    ok: true,
    value: {
      id: cleanId,
      title: cleanTitle,
      techstack: cleanTechstack,
      link: cleanLink,
      image: cleanImage,
    },
  };
}