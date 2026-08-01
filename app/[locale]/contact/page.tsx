import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, site, type Locale } from "@/config/site";
import { getContent } from "@/lib/content";
import { localizedMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import type { EnquiryType } from "@/lib/validation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const typedLocale: Locale = locale;
  const page = getContent(typedLocale).pages.contact;
  return localizedMetadata({ locale: typedLocale, path: "/contact", title: page.title, description: page.intro, image: "/media/inside/harvest-close.webp" });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; plan?: string }>;
}) {
  const { locale } = await params;
  const { type, plan } = await searchParams;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  const content = getContent(typedLocale);
  const page = content.pages.contact;
  const initialType: EnquiryType = type === "hug" ? "hug" : "project";

  return (
    <>
      <PageHero headline={page.headline} intro={page.intro} />

      <Section tone="warm">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <ContactForm
            content={content}
            locale={typedLocale}
            initialType={initialType}
            plan={plan}
          />

          <aside className="rounded-sm border border-line p-7">
            <h2 className="eyebrow opacity-60">{page.directLabel}</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-forest underline-offset-4 hover:underline"
                >
                  <bdi dir="ltr">{site.email}</bdi>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phoneE164}`}
                  className="text-forest underline-offset-4 hover:underline"
                >
                  <bdi dir="ltr">{site.phoneDisplay}</bdi>
                </a>
              </li>
              <li>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest underline-offset-4 hover:underline"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-2 text-ink/65">{site.location}</li>
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
