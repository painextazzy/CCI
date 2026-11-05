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
