import ActorTopbar from "../components/ActorTopbar";
import AuthGuard from "../components/AuthGuard";

export default function ActorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["COMPANY"]}>
      <div className="actor-theme min-h-screen">
        <ActorTopbar />
        <main className="min-h-screen bg-[#f5f5f58c] px-3 sm:px-6 lg:px-16 pt-24 pb-16">
          <div className="max-w-350 mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
