// Shared HTTP client for the portfolio API.
//
// Every view/component used to hand-roll `fetch(...)` with the same
// Authorization header, `Content-Type` JSON header, `res.ok` check and
// `res.json()` parsing. These helpers centralize that boilerplate.
//
// `apiRequest` never throws on an HTTP error status (matching the previous
// `if (res.ok) { ... } else { ... }` style): it resolves to a normalized
// `{ ok, status, data }` result. Only genuine network failures reject, just
// like a bare `fetch`, so callers can keep their existing `try/catch`.

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(path, { method = "GET", body, token, form = false } = {}) {
  const headers = { ...authHeaders(token) };
  let payload;

  if (form) {
    payload = body; // FormData: let the browser set the multipart boundary.
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(path, { method, headers, body: payload });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null; // Empty or non-JSON body (e.g. some DELETE responses).
  }

  return { ok: res.ok, status: res.status, data };
}

export const apiGet = (path, token) => apiRequest(path, { token });
export const apiPost = (path, body, token) => apiRequest(path, { method: "POST", body, token });
export const apiPut = (path, body, token) => apiRequest(path, { method: "PUT", body, token });
export const apiDelete = (path, token) => apiRequest(path, { method: "DELETE", token });

// Uploads a single file via multipart/form-data to the upload endpoint.
export function uploadFile(file, token, field = "file") {
  const formData = new FormData();
  formData.append(field, file);
  return apiRequest("/api/upload", { method: "POST", body: formData, token, form: true });
}

// Convenience for public "read" endpoints: returns the parsed JSON on success,
// or `fallback` if the request fails (non-OK status or network error). This
// mirrors the old `try { if (res.ok) setX(await res.json()) } catch {}` pattern.
export async function fetchJson(path, fallback = null, token) {
  try {
    const { ok, data } = await apiRequest(path, { token });
    if (ok) return data;
  } catch (err) {
    console.error(err);
  }
  return fallback;
}
