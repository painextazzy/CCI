"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getApiRoot } from "../lib/auth";

export default function SiteVisitTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    async function recordVisit() {
      try {
        const response = await fetch(`${getApiRoot()}/site-visits`, {
          method: "POST",
          keepalive: true,
        });
        if (!response.ok) {
          throw new Error(`Échec de l’enregistrement de la visite (${response.status}).`);
        }
      } catch (error) {
        console.error("Impossible d’enregistrer la visite du site.", error);
      }
    }

    void recordVisit();
  }, [pathname]);

  return null;
}
