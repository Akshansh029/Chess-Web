export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export async function parseBackendError(response: Response): Promise<Error> {
  try {
    const data = await response.json();
    if (data && typeof data === "object" && typeof data.message === "string") {
      return new Error(data.message);
    }
  } catch (e) {
    // Not JSON or missing message field
  }

  try {
    const text = await response.text();
    if (text && text.trim().length > 0) {
      return new Error(text);
    }
  } catch (e) {
    // Response body is not text-readable
  }

  return new Error(response.statusText || `Request failed with status ${response.status}`);
}
