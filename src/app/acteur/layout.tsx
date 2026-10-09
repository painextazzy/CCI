import ActorTopbar from "../components/ActorTopbar";

export default function ActorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfdfd] to-[#f2faf8]">
      {/* Navbar fixe en haut */}
      <ActorTopbar />

      {/* Contenu principal (plus de margin-left car plus de sidebar) */}
      <main className="min-h-screen px-6 sm:px-10 lg:px-16 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}