export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ContactResult = {
  success: boolean;
  error?: string;
  /** True when the request could not reach the server at all (offline, DNS, refused). Safe to queue for retry. */
  networkError?: boolean;
};

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
      return { success: false, error };
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
