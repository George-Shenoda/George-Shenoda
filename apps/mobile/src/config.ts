export const SITE_URL = (
  process.env.EXPO_PUBLIC_SITE_URL?.trim() || 'https://george-shenoda.vercel.app'
).replace(/\/$/, '');

export function resolveAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url}`;
}
