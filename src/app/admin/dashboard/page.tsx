"use client";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
      <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-2xs">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Dashboard
      </h1>
      <p className="text-xs text-slate-500 font-medium mt-1">
        Page de test de la navigation administrateur (CCI B2B Connect)
      </p>
    </div>
  );
}