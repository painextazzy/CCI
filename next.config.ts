import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Ajoutez ici le domaine de votre image en ligne :
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;