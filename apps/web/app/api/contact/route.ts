import { sendContactEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { name, email, message } = (payload ?? {}) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
  };

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    return Response.json(
      { success: false, error: 'name, email and message are required.' },
      { status: 400 }
    );
  }

  const result = await sendContactEmail({ name, email, message });

  if (!result.success) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
