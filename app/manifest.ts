import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iPlant — Urban Farming Systems",
    short_name: "iPlant",
    description: "Smart urban farming systems for real MENA conditions.",
    start_url: "/en",
    display: "standalone",
    background_color: "#061813",
    theme_color: "#061813",
    icons: [
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
