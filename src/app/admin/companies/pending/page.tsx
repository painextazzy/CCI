import PendingCompaniesClient from "./PendingCompaniesClient";
import type { CompanyRequest } from "./PendingCompaniesClient";
import { getApiRoot } from "../../../lib/auth";

export default async function PendingCompaniesPage() {
  let companies: CompanyRequest[] = [];

  try {
    const res = await fetch(`${getApiRoot()}/companies`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP (${res.status}): Impossible de récupérer les entreprises`);
    }

    companies = await res.json();
  } catch (error) {
    console.error("Erreur de connexion au backend :", error);
  }

  return <PendingCompaniesClient initialCompanies={companies} />;
}