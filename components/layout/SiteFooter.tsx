import Image from "next/image";
import Link from "next/link";
import { site, type Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";

export function SiteFooter({ locale, content }: { locale: Locale; content: Content }) {
  const year = new Date().getFullYear();
  const controllerHref = site.controllerUrl || `/${locale}/contact?type=controller-access`;

  return (
    <footer className="bg-ink text-paper/82">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-[1.35fr_1fr_1fr] md:px-10 md:py-20">
        <div>
          <Link href={`/${locale}`} aria-label={locale === "ar" ? "العودة إلى الصفحة الرئيسية" : "Return to the iPlant home page"}>
            <Image src="/brand/iplant-wordmark-light.png" alt="iPlant" width={774} height={246} className="h-9 w-auto" />
          </Link>
          <p className="lead measure mt-5 text-paper/82">{content.footer.blurb}</p>
          <Link href={controllerHref} target={site.controllerUrl ? "_blank" : undefined} rel={site.controllerUrl ? "noopener noreferrer" : undefined} className="mt-6 inline-flex items-center gap-2 text-sm text-aqua transition-opacity hover:opacity-75">
            {content.footer.controllerLabel}<span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div>
          <h2 className="eyebrow mb-5 text-paper/72">{content.footer.columns.explore}</h2>
          <ul className="columns-2 gap-x-7 space-y-3 md:columns-1">
            {content.nav.map((item) => {
              const href = resolveHref(item.href, locale);
              const external = "external" in item && item.external;
              return (
                <li key={item.label}>
                  <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="transition-colors hover:text-aqua">
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-5 text-paper/72">{content.footer.columns.contact}</h2>
          <ul className="space-y-3">
            <li><a href={`mailto:${site.email}`} className="transition-colors hover:text-aqua"><bdi dir="ltr">{site.email}</bdi></a></li>
            <li><a href={`tel:${site.phoneE164}`} className="transition-colors hover:text-aqua"><bdi dir="ltr">{site.phoneDisplay}</bdi></a></li>
            <li><a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-aqua">{content.site.whatsappLabel ?? "WhatsApp"}</a></li>
            <li className="pt-2 text-paper/72">{content.site.location ?? site.location}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm text-paper/45 md:px-10">
          <p><bdi dir="ltr">{year}</bdi> iPlant. {content.footer.rights}</p>
          <div className="flex flex-wrap gap-5">
            <Link href={`/${locale}/privacy`} className="hover:text-aqua">{content.footer.privacy}</Link>
            {site.social.linkedin ? <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-aqua">LinkedIn</a> : null}
            {site.social.instagram ? <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-aqua">Instagram</a> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
