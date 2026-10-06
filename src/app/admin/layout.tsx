import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#eaf6f694] p-4 sm:p-6">
      {/* Header en fixed */}
      <AdminHeader />

      {/* Conteneur global avec un padding-top (pt-24 ou pt-28) pour éviter que le header fixe ne cache le contenu */}
      <div className="max-w-[1600px] mx-auto pt-20 sm:pt-24">
        {/* Grille : Sidebar + Contenu */}
        <div className="flex gap-4 sm:gap-5">
         
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}