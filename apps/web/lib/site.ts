export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/$/, "");

export const LIVE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://george-shenoda.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "George Shenoda";

export const SITE_TITLE = `${SITE_NAME} | Full-Stack Developer`;

export const SITE_DESCRIPTION =
  "Portfolio of George Shenoda — full-stack developer bridging mechatronics and code. Responsive web apps, IoT dashboards, and business automation from concept to deployment.";
