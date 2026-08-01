import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { LOCALES, dirFor, isLocale, site, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "../globals.css";

const plexLatin = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-latin", display: "swap" });
const arabicSans = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-arabic", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-plex-mono", display: "swap" });

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  return {
    metadataBase: new URL(site.siteUrl),
    title: { default: content.site.seoTitle ?? `${site.name} — ${content.site.description}`, template: `%s — ${site.name}` },
    description: content.site.seoDescription ?? content.site.description,
    alternates: { canonical: `/${typedLocale}`, languages: { en: "/en", ar: "/ar", "x-default": "/en" } },
    openGraph: {
      type: "website",
      locale: typedLocale === "ar" ? "ar_JO" : "en_JO",
      alternateLocale: typedLocale === "ar" ? "en_JO" : "ar_JO",
      siteName: site.name,
      title: content.site.seoTitle ?? content.site.description,
      description: content.site.seoDescription ?? content.site.description,
      url: `${site.siteUrl}/${typedLocale}`,
      images: [{ url: "/brand/iplant-social-preview.jpg", width: 1200, height: 630, alt: content.site.description }],
    },
    twitter: { card: "summary_large_image", images: ["/brand/iplant-social-preview.jpg"] },
    icons: { icon: "/brand/icon-512.png", apple: "/brand/apple-touch-icon.png" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const fontFamily = typedLocale === "ar"
    ? "var(--font-arabic), var(--font-plex-latin), sans-serif"
    : "var(--font-plex-latin), sans-serif";
  return (
    <html
      lang={typedLocale}
      dir={dirFor(typedLocale)}
      className={`${plexLatin.variable} ${arabicSans.variable} ${plexMono.variable}`}
      style={{ ["--font-plex" as string]: fontFamily }}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">{content.a11y.skipToContent}</a>
        <SiteHeader locale={typedLocale} content={content} />
        <main id="main">{children}</main>
        <SiteFooter locale={typedLocale} content={content} />
      </body>
    </html>
  );
}
