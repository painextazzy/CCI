import PendingCompaniesClient from "./PendingCompaniesClient";

export default async function PendingCompaniesPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;

  try {
    const res = await fetch(`${apiUrl}/companies`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP (${res.status}): Impossible de récupérer les entreprises`);
    }

    const companies = await res.json();

    return <PendingCompaniesClient initialCompanies={companies} />;
  } catch (error) {
    console.error("Erreur de connexion au backend :", error);
    return <PendingCompaniesClient initialCompanies={[]} />;
  }
}