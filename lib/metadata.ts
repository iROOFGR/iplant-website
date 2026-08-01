import type { Metadata } from "next";
import { LOCALES, site, type Locale } from "@/config/site";

export function localizedMetadata({
  locale,
  path = "",
  title,
  description,
  image = "/brand/iplant-social-preview.jpg",
  imageAlt = title,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const localizedPath = `/${locale}${path}`;
  const url = `${site.siteUrl}${localizedPath}`;
  const images = [{ url: image, alt: imageAlt }];

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((language) => [language, `/${language}${path}`]),
        ),
        "x-default": `/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_JO" : "en_JO",
      alternateLocale: locale === "ar" ? "en_JO" : "ar_JO",
      siteName: site.name,
      title,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
