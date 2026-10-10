import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "CCI B2B Connect - Plateforme d'Affaires & Réseau Consulaire Certifié",
  description:
    "Accédez à la communauté d'entreprises qualifiées, certifiées par les Chambres de Commerce et d'Industrie. Échangez en toute sécurité avec des partenaires solvables et vérifiés sous 24h.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} scroll-smooth`}>
      <body className="relative antialiased selection:bg-teal-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}