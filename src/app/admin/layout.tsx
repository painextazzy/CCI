"use client";

import AdminHeader from "../components//AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#e9f2f2] text-slate-800 font-sans min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center antialiased">
      <div className="w-full max-w-[1400px] flex flex-col gap-6">
        {/* Navbar séparée sans boîte parent */}
        <AdminHeader />

        {/* Zone de contenu principale */}
        <main className="w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}