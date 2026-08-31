export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  website?: string;
};

export type ContactResult = {
  success: boolean;
  error?: string;
  /** True when the request could not reach the server at all (offline, DNS, refused). Safe to queue for retry. */
  networkError?: boolean;
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function submitContact(
  baseUrl: string,
  payload: ContactPayload
): Promise<ContactResult> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let error = `Request failed with status ${response.status}.`;
      try {
        const data = (await response.json()) as { error?: string };
        if (data?.error) error = data.error;
      } catch {}
      // 4xx/5xx are NOT network errors — don't queue for retry
      return { success: false, error, networkError: false };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      networkError: true,
      error: "Could not reach the contact service. Please try again later.",
    };
  }
}
