import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FaasSection, FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.faas;
  return localizedMetadata({ locale: typedLocale, path: "/farming-as-a-service", title: page.title, description: page.intro, image: "/media/systems/hug-installed.webp" });
}

export default async function FaasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.faas;

  return (
    <>
      <PageHero
        eyebrow={content.faas.eyebrow}
        headline={page.headline}
        intro={page.intro}
        image={page.image}
      />

      <Section tone="paper">
        <h2 className="eyebrow opacity-60">{page.howLabel}</h2>
        <Reveal as="ul" className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {page.how.map((step, index) => (
            <li key={step.title} className="border-t border-line pt-5">
              <span className="eyebrow text-forest">
                <bdi>{String(index + 1).padStart(2, "0")}</bdi>
              </span>
              <h3 className="h3 mt-3">{step.title}</h3>
              <p className="mt-2 text-ink/75">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      <FaasSection locale={typedLocale} content={content} />
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
