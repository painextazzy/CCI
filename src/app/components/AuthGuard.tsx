"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { getRoleHome } from "../lib/auth";

type AuthGuardProps = {
  allowedRoles: Array<"ADMIN" | "CCI_STAFF" | "COMPANY">;
  children: ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { user, isLoading, error, refreshUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || error) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(getRoleHome(user.role));
    }
  }, [allowedRoles, error, isLoading, pathname, router, user]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-slate-700">
        <p>{error}</p>
        <button
          onClick={() => void refreshUser().catch(() => undefined)}
          className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Vérification de votre session...
      </div>
    );
  }
  return children;
}
