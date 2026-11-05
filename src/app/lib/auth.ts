export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CCI_STAFF" | "COMPANY";
  avatarUrl?: string | null;
  createdAt?: string;
  company?: {
    id?: string;
    companyName?: string;
    companyType?: string;
    nif?: string;
    stat?: string;
    address?: string;
    managerName?: string;
    managerRole?: string;
    phone?: string;
    website?: string | null;
    sector?: string;
    sectorOther?: string | null;
    verificationStatus?: string;
  } | null;
};

const ACCESS_TOKEN_STORAGE_KEY = "cci_access_token";
export const AUTH_UNAUTHORIZED_EVENT = "cci:unauthorized";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined" || !token) {
    throw new Error("Impossible d’enregistrer le jeton d’authentification.");
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (response.status === 401 && token && typeof window !== "undefined") {
    clearAccessToken();
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }

  return response;
}

export function getRoleHome(role: AuthUser["role"]) {
  return role === "COMPANY" ? "/acteur/opportunites" : "/admin/dashboard";
}

export function getApiRoot() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
    /\/+$/,
    "",
  );
  const productionApiUrl = "https://cci-lsy3.onrender.com";

  if (!configuredApiUrl) {
    if (process.env.NODE_ENV === "production") {
      return `${productionApiUrl}/api`;
    }
    throw new Error("La variable NEXT_PUBLIC_API_URL n'est pas configurée.");
  }

  if (process.env.NODE_ENV === "production") {
    const configuredHost = new URL(configuredApiUrl).hostname;
    if (
      configuredHost === "localhost" ||
      configuredHost === "127.0.0.1" ||
      configuredHost === "::1"
    ) {
      return `${productionApiUrl}/api`;
    }
  }

  return /\/api$/i.test(configuredApiUrl)
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;
}
