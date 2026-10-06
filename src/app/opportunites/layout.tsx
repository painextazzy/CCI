import ActorHeader from "../components/ActorHeader";

export default function ActorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#eaf6f694] p-4 sm:p-6 pb-20">
      {/* Le Header fixe / sticky présent sur toutes les pages acteur */}
      <ActorHeader />

      {/* Conteneur principal pour les pages enfants */}
      <main className="max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}