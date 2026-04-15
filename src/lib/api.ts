import { API_URL } from "./constants";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Authenticated fetch wrapper.
 * Gets the Clerk session token and adds it as Bearer token.
 * Must be called from a component/hook that has access to Clerk's auth.
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (getToken) {
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // Super admin impersonation header
  const { impersonatingCompanyId } = useAuthStore.getState();
  if (impersonatingCompanyId) {
    headers.set("X-Impersonate-Company", String(impersonatingCompanyId));
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    throw new Error("AUTH_EXPIRED");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Error ${res.status}` }));
    throw new Error(err.error || `Error ${res.status}`);
  }

  return res;
}
