import type { MetadataRoute } from "next";
import { LOCALES, site } from "@/config/site";

const ROUTES = [
  "",
  "/systems",
  "/systems/hug",
  "/systems/greenspin",
  "/systems/rooftop-farming",
  "/systems/automation",
  "/farming-as-a-service",
  "/projects",
  "/consultation",
  "/virtual-farm",
  "/about",
  "/contact",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${site.siteUrl}/${locale}${route}`,
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          [
            ...LOCALES.map((alt) => [alt, `${site.siteUrl}/${alt}${route}`]),
            ["x-default", `${site.siteUrl}/en${route}`],
          ],
        ),
      },
    })),
  );
}
