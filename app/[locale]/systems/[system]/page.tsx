import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, site, type Locale } from "@/config/site";
import { getContent, resolveHref } from "@/lib/content";
import { localizedMetadata, safeJsonLd } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/HomeSections";
import { SystemDetailExperience } from "@/components/sections/SystemDetailExperience";

/** URL slug -> content key. The slugs are fixed by the approved route list. */
const SYSTEMS = {
  hug: "hug",
  greenspin: "greenspin",
  "rooftop-farming": "rooftop",
  automation: "automation",
} as const;

type Slug = keyof typeof SYSTEMS;

const isSlug = (value: string): value is Slug => value in SYSTEMS;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    Object.keys(SYSTEMS).map((system) => ({ locale, system })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; system: string }>;
}): Promise<Metadata> {
  const { locale, system } = await params;
  if (!isLocale(locale) || !isSlug(system)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages[SYSTEMS[system]];
  return localizedMetadata({
    locale: typedLocale,
    path: `/systems/${system}`,
    title: page.title,
    description: page.intro,
    image: page.image,
  });
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ locale: string; system: string }>;
}) {
  const { locale, system } = await params;
  if (!isLocale(locale) || !isSlug(system)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages[SYSTEMS[system]];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.intro,
    provider: { "@type": "Organization", name: site.name, url: site.siteUrl },
    areaServed: { "@type": "Country", name: "Jordan" },
    url: `${site.siteUrl}/${typedLocale}/systems/${system}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }} />
      <PageHero
        backHref={`/${typedLocale}/systems`}
        backLabel={content.systems.backLabel}
        headline={page.headline}
        intro={page.intro}
        image={page.image}
      />

      <SystemDetailExperience
        system={SYSTEMS[system]}
        page={page}
        content={content}
        locale={typedLocale}
      />

      {system === "automation" ? (
        <Section tone="forest">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow text-aqua">{content.controller.label}</p>
              <h2 className="h2 mt-3 text-paper">{content.controller.title}</h2>
              <p className="lead measure mt-4 text-paper/75">{content.controller.body}</p>
            </div>
            <div className="lg:justify-self-end">
              <a
                href={resolveHref(content.controller.href, typedLocale)}
                target={site.controllerUrl ? "_blank" : undefined}
                rel={site.controllerUrl ? "noopener noreferrer" : undefined}
                className="btn bg-aqua text-ink hover:scale-[1.03]"
              >
                {content.controller.cta}
              </a>
            </div>
          </div>
        </Section>
      ) : null}

      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
