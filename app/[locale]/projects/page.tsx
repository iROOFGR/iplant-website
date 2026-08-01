import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { FinalCta } from "@/components/sections/HomeSections";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { CredibilityStrip } from "@/components/sections/CredibilityStrip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.projects;
  return localizedMetadata({ locale: typedLocale, path: "/projects", title: page.title, description: page.intro, image: "/media/projects/project-rss.webp" });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.projects;

  return (
    <>
      <PageHero
        eyebrow={content.projects.eyebrow}
        headline={page.headline}
        intro={page.intro}
        image="/media/projects/project-cea-room.webp"
      />
      <ProjectsShowcase content={content} locale={typedLocale} />
      <CredibilityStrip content={content} />
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
