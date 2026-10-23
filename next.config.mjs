import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Un autre package-lock.json existe dans le dossier parent : on fixe la racine du projet
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    // Loader maison : Unsplash redimensionne via ses paramètres d'URL, Supabase Storage sert l'original.
    // Évite de consommer le quota d'optimisation d'images de Vercel.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
