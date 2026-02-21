import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Comdes | Interactive Compiler Learning",
    short_name: "Comdes",
    description:
      "Interactive Compiler Design Learning Platform. Build context-free grammars, compute FIRST & FOLLOW sets, and simulate parsing trees.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
