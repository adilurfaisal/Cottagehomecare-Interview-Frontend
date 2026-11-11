const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/$/, "");

/** Send a request to the application's API and return its data payload. */
export async function api(path, options = {}) {
  const { token, body, headers, ...requestOptions } = options;
  const requestHeaders = { ...headers };

  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  // DELETE endpoints sometimes return an empty response.
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload?.data ?? null;
}
