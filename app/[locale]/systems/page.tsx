import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { SystemsGrid } from "@/components/sections/SystemsGrid";
import { FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.systems;
  return localizedMetadata({ locale: typedLocale, path: "/systems", title: page.title, description: page.intro, image: "/media/systems/hug-canopy.webp" });
}

export default async function SystemsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.systems;

  return (
    <>
      <PageHero
        eyebrow={content.systems.eyebrow}
        headline={page.headline}
        intro={page.intro}
        image="/media/systems/hug-canopy.webp"
      />
      <SystemsGrid locale={typedLocale} content={content} />
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
