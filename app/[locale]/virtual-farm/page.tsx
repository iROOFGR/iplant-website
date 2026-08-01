import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { VirtualFarmExplorer } from "@/components/sections/VirtualFarmExplorer";
import { GrowPlanner } from "@/components/planner/GrowPlanner";
import { FinalCta } from "@/components/sections/HomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  return localizedMetadata({ locale: typedLocale, path: "/virtual-farm", title: content.planner.headline, description: content.planner.intro, image: "/media/systems/productive-rooftop-farming.webp" });
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

  return (
    <>
      <PageHero
        eyebrow={content.planner.eyebrow}
        headline={content.planner.headline}
        intro={content.planner.intro}
        image="/media/systems/productive-rooftop-farming.webp"
      />
      <div className="bg-paper-warm text-ink">
        <GrowPlanner locale={typedLocale} content={content} />
      </div>
      <div className="bg-paper text-ink">
        <VirtualFarmExplorer content={content} />
      </div>
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
