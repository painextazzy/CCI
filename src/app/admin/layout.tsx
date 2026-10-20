import AdminHeader from "../components/AdminHeader";
import AuthGuard from "../components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "CCI_STAFF"]}>
      <div className="min-h-screen bg-[#eaf6f694] py-4 sm:py-6">
        <AdminHeader />
        <div className="mx-auto w-full max-w-7xl px-3 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
