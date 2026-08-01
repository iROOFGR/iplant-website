import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.privacy;
  return localizedMetadata({ locale: typedLocale, path: "/privacy", title: page.title, description: page.intro, image: "/media/supporting/leaf-detail.webp" });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.privacy;

  return (
    <>
      <PageHero headline={page.headline} intro={page.intro} image="/media/supporting/leaf-detail.webp" />
      <Section tone="paper">
        <div className="mx-auto max-w-4xl space-y-10">
          {page.sections.map((section) => (
            <Reveal key={section.title}>
              <section className="border-t border-line pt-6">
                <h2 className="h3">{section.title}</h2>
                <p className="measure mt-3 text-ink/75">{section.body}</p>
              </section>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
