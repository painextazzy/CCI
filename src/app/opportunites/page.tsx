import Link from "next/link";
import Image from "next/image";
import OpportunitiesPage from "../components/OpportunitiesPage";

export default function PublicOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfdfd] to-[#f2faf8]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CCI B2B Connect"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
            <span className="font-extrabold tracking-tight text-emerald-700">
              B2B Connect
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>
      <main className="px-4 pb-8 pt-24 sm:px-6">
        <OpportunitiesPage isPublic />
      </main>
    </div>
  );
}
