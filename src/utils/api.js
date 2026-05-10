const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function buildUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch(path, options = {}) {
  const { token, headers = {}, body, ...rest } = options;
  const mergedHeaders = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...rest,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    headers: mergedHeaders,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Erreur API";
    throw new Error(message);
  }

  return data;
}
