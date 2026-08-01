import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, site, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.about;
  return localizedMetadata({ locale: typedLocale, path: "/about", title: page.title, description: page.intro, image: "/media/supporting/install-work.webp" });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.about;

  return (
    <>
      <PageHero headline={page.headline} intro={page.intro} image={page.image} />

      <Section tone="paper">
        <h2 className="eyebrow opacity-60">{page.capabilitiesLabel}</h2>
        <Reveal as="ul" className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {page.capabilities.map((capability) => (
            <li key={capability.title} className="border-t border-line pt-5">
              <h3 className="h3">{capability.title}</h3>
              <p className="mt-2 text-ink/75">{capability.body}</p>
            </li>
          ))}
        </Reveal>

        <p className="measure mt-14 border-s-2 border-forest/25 ps-5 text-ink/75">
          {content.waterClaim}
        </p>

        <p className="mt-10 text-ink/70">
          {site.location} ·{" "}
          <a href={`mailto:${site.email}`} className="text-forest underline-offset-4 hover:underline">
            <bdi dir="ltr">{site.email}</bdi>
          </a>
        </p>
      </Section>

      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
