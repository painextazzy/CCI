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
