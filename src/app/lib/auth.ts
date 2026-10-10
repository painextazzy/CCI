export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CCI_STAFF" | "COMPANY";
  company?: {
    companyName?: string;
  } | null;
};

export function getRoleHome(role: AuthUser["role"]) {
  return role === "COMPANY" ? "/acteur/opportunites" : "/admin/dashboard";
}

export function getApiRoot() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!configuredApiUrl) {
    throw new Error("La variable NEXT_PUBLIC_API_URL n'est pas configurée.");
  }
  return /\/api$/i.test(configuredApiUrl)
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;
}
