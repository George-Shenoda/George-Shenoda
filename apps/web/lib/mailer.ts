import nodemailer from 'nodemailer';
import { escapeHtml, isValidEmail, stripCrlf } from './sanitize';

export type ContactFormState = {
  success?: boolean;
  error?: string;
  /** Parity with shared ContactResult — never set by the web server action path. */
  networkError?: boolean;
};

const EMAIL_STYLES = `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 24px;
            color: #18181b;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e4e4e7;
          }
          .header {
            border-bottom: 2px solid #f4f4f5;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #09090b;
            margin: 0 0 6px;
          }
          .subtitle {
            font-size: 14px;
            color: #71717a;
            margin: 0;
          }
          .field {
            margin-bottom: 20px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            color: #71717a;
            margin-bottom: 6px;
          }
          .value {
            font-size: 16px;
            color: #18181b;
            font-weight: 500;
          }
          .message-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            font-size: 15px;
            line-height: 1.6;
            white-space: pre-wrap;
            color: #334155;
          }
          .footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #f4f4f5;
            font-size: 13px;
            color: #a1a1aa;
            text-align: center;
          }`;

function emailWrapper(title: string, subtitle: string, body: string, footer: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${EMAIL_STYLES}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">${title}</h1>
            <p class="subtitle">${subtitle}</p>
          </div>
          ${body}
          <div class="footer">
            ${footer}
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildContactEmailHtml(name: string, email: string, message: string) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const body = `
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${safeName}</div>
          </div>
          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a></div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${safeMessage}</div>
          </div>`;
  return emailWrapper(
    'New Contact Message',
    'Sent from your portfolio website',
    body,
    `Hit "Reply" in your email client to respond directly to ${safeName} (${safeEmail}).`
  );
}

function buildAutoReplyHtml(name: string, email: string, fromEmail: string | undefined) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeFromEmail = escapeHtml(fromEmail ?? '');
  const body = `
          <div class="field">
            <div class="label">To</div>
            <div class="value">${safeEmail}</div>
          </div>
          <div class="field">
            <div class="label">From</div>
            <div class="value">${safeFromEmail}</div>
          </div>
          <div class="field">
            <div class="label">Regarding</div>
            <div class="value">${safeName} (${safeEmail})</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value">Thank you for contacting me! I have received your message and will get back to you as soon as possible.</div>
          </div>`;
  return emailWrapper(
    'Thank You for Your Message!',
    "I'll get back to you soon",
    body,
    'This is an automated confirmation. You can reply to this email to continue the conversation.'
  );
}

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactFormState> {
  try {
    const { name, email, message } = formData;

    // 1. Validate inputs
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter a valid name (at least 2 characters).' };
    }

    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!message || message.trim().length < 5) {
      return { success: false, error: 'Please enter a message with at least 5 characters.' };
    }

    // 2. Read SMTP credentials from env
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass =
      process.env.EMAIL_PASS ||
      process.env.GMAIL_PASS ||
      process.env.GMAIL_APP_PASSWORD;
    const toEmail =
      process.env.EMAIL_TO ||
      process.env.CONTACT_TO_EMAIL ||
      emailUser;

    if (!emailUser || !emailPass) {
      console.error('Gmail SMTP credentials missing. Please set EMAIL_USER and EMAIL_PASS in .env');
      return {
        success: false,
        error: 'Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in .env.',
      };
    }

    // 3. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const sanitizedName = stripCrlf(name.trim()).replace(/"/g, "'");
    const sanitizedEmail = stripCrlf(email.trim());
    const sanitizedMessage = message.trim();

    // Warn when CONTACT_TO_EMAIL/EMAIL_TO not configured — email will go to sender account
    if (toEmail === emailUser) {
      console.warn('[mailer] EMAIL_TO/CONTACT_TO_EMAIL not set — delivering contact mail to EMAIL_USER itself');
    }

    // 4. Send Email via Gmail SMTP
    await transporter.sendMail({
      from: `"${sanitizedName} (Portfolio)" <${emailUser}>`,
      to: toEmail,
      replyTo: sanitizedEmail,
      subject: `New Portfolio Message from ${sanitizedName}`,
      text: `You received a new message from your portfolio contact form:\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}`,
      html: buildContactEmailHtml(sanitizedName, sanitizedEmail, sanitizedMessage),
    });

    // Optional auto-reply to the form submitter
    const autoReplyEnabled = process.env.CONTACT_AUTO_REPLY !== 'false';
    if (autoReplyEnabled) {
      await transporter.sendMail({
        from: toEmail,
        to: sanitizedEmail,
        subject: `Re: New Portfolio Message from ${sanitizedName}`,
        text: `Thank you for contacting me! I have received your message and will get back to you as soon as possible.\n\nBest regards,\nGeorge Shenoda`,
        html: buildAutoReplyHtml(sanitizedName, sanitizedEmail, emailUser),
      });
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Nodemailer error:', err);
    return { success: false, error: 'Failed to send message. Please try again later.' };
  }
}
