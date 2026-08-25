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

const routePriority = (route: string) => {
  if (route === "") return 1;
  if (route.startsWith("/systems/") || route === "/farming-as-a-service" || route === "/consultation") return 0.9;
  if (route === "/systems" || route === "/projects" || route === "/virtual-farm" || route === "/contact") return 0.8;
  if (route === "/privacy") return 0.3;
  return 0.6;
};

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${site.siteUrl}/${locale}${route}`,
      lastModified: new Date("2026-08-01"),
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: routePriority(route),
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
