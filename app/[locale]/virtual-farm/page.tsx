import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { VirtualFarmExplorer } from "@/components/sections/VirtualFarmExplorer";
import { FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.virtualFarm;
  return localizedMetadata({ locale: typedLocale, path: "/virtual-farm", title: page.title, description: page.intro, image: "/media/systems/productive-rooftop-farming.webp" });
}

export default async function VirtualFarmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.virtualFarm;

  return (
    <>
      <PageHero
        eyebrow={content.virtualFarm.eyebrow}
        headline={page.headline}
        intro={page.intro}
        image="/media/systems/productive-rooftop-farming.webp"
      />
      <div className="bg-paper text-ink">
        <VirtualFarmExplorer content={content} />
      </div>
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
