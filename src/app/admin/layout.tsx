import AdminHeader from "../components/AdminHeader";
import AuthGuard from "../components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "CCI_STAFF"]}>
      <div className="min-h-screen bg-[#eaf6f694] p-4 sm:p-6">
        <AdminHeader />
        <div className="max-w-[1600px] mx-auto pt-20 sm:pt-24">
          <div className="flex gap-4 sm:gap-5">
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}