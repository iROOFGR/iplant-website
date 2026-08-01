import { notFound } from "next/navigation";
import { isLocale, site, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { safeJsonLd } from "@/lib/metadata";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { SystemsGrid } from "@/components/sections/SystemsGrid";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { FieldMosaic } from "@/components/sections/FieldMosaic";
import {
  ConsultationSection,
  FaasSection,
  FinalCta,
  IroofSection,
  VirtualFarmInvite,
} from "@/components/sections/HomeSections";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: `${site.siteUrl}/${typedLocale}`,
    logo: `${site.siteUrl}/brand/iplant-wordmark-dark.png`,
    description: content.site.tagline,
    email: site.email,
    telephone: site.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Amman",
      addressCountry: "JO",
    },
    sameAs: [site.social.linkedin, site.social.instagram].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <CinematicHero locale={typedLocale} content={content} />
      <SystemsGrid locale={typedLocale} content={content} />
      <FaasSection locale={typedLocale} content={content} />
      <IroofSection locale={typedLocale} content={content} />
      <ProjectsShowcase content={content} locale={typedLocale} variant="compact" limit={3} />
      <FieldMosaic content={content} locale={typedLocale} />
      <ConsultationSection locale={typedLocale} content={content} />
      <VirtualFarmInvite locale={typedLocale} content={content} />
      <FinalCta locale={typedLocale} content={content} />
    </>
  );
}
