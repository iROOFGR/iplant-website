import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { ConsultationSection, FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.consultation;
  return localizedMetadata({ locale: typedLocale, path: "/consultation", title: page.title, description: page.intro, image: "/media/consultation/consultation-02.webp" });
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.consultation;

  return (
    <>
      <PageHero
        eyebrow={content.consultation.eyebrow}
        headline={page.headline}
        intro={page.intro}
        image="/media/consultation/consultation-02.webp"
      />
      <ConsultationSection locale={typedLocale} content={content} />
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
