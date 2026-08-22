'use server';

import { sendContactEmail as sendEmail } from '@/lib/mailer';

export type { ContactFormState } from '@/lib/mailer';

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
  return sendEmail(formData);
}
