"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getRoleHome } from "../lib/auth";
import { useAuth } from "../providers/AuthProvider";

export default function HomeAuthRedirect({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getRoleHome(user.role));
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        {isLoading
          ? "Vérification de votre session..."
          : "Redirection vers votre espace..."}
      </div>
    );
  }

  return children;
}
