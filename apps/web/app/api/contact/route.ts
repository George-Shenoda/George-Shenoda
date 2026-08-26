import { sendContactEmail } from '@/lib/mailer';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const MAX_BODY_SIZE = 10_240; // 10KB
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

function isAllowedOrigin(origin: string | null): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  if (!origin || origin === 'null') return true; // Electron (file:// or local server)
  if (origin === siteUrl) return true;
  // Allow any localhost / 127.0.0.1 port (Electron dev + prod)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Mobile app origins (Capacitor, Expo web)
  if (origin === 'capacitor://localhost' || origin === 'http://localhost') return true;
  return false;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const allowedOrigin = isAllowedOrigin(origin) ? (origin ?? siteUrl) : siteUrl;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  // Rate limiting
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  headers['X-RateLimit-Limit'] = '5';
  headers['X-RateLimit-Remaining'] = String(rl.remaining);
  headers['X-RateLimit-Reset'] = String(Math.ceil(rl.resetAt / 1000));

  if (!rl.success) {
    return Response.json(
      { success: false, error: 'Too many requests. Please wait before submitting again.' },
      { status: 429, headers }
    );
  }

  // Body size limit
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return Response.json(
      { success: false, error: 'Request body too large.' },
      { status: 413, headers }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400, headers }
    );
  }

  const { name, email, message, website } = (payload ?? {}) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    website?: unknown;
  };

  // Honeypot check
  if (typeof website === 'string' && website.trim().length > 0) {
    return Response.json(
      { success: false, error: 'Spam detected.' },
      { status: 400, headers }
    );
  }

  // Type checks
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    return Response.json(
      { success: false, error: 'name, email and message are required.' },
      { status: 400, headers }
    );
  }

  // Length limits
  if (name.length > MAX_NAME_LENGTH) {
    return Response.json(
      { success: false, error: `Name must be ${MAX_NAME_LENGTH} characters or less.` },
      { status: 400, headers }
    );
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return Response.json(
      { success: false, error: `Email must be ${MAX_EMAIL_LENGTH} characters or less.` },
      { status: 400, headers }
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { success: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.` },
      { status: 400, headers }
    );
  }

  const result = await sendContactEmail({ name, email, message });

  if (!result.success) {
    return Response.json(result, { status: 400, headers });
  }

  return Response.json(result, { headers });
}