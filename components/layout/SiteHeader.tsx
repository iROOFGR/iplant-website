"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, type Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";

export function SiteHeader({ locale, content }: { locale: Locale; content: Content }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("a")?.focus(), 0);
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "";
  const homeHref = `/${locale}`;
  const controllerHref = site.controllerUrl || `/${locale}/contact?type=controller-access`;
  const desktopItems = content.nav.filter((item) => item.href !== "/");

  const isActive = (href: string) => {
    if (href === "/") return pathname === homeHref || pathname === `${homeHref}/`;
    if (!href.startsWith("/")) return false;
    const localized = `/${locale}${href}`;
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${
      scrolled || menuOpen ? "border-line-dark bg-ink/95 backdrop-blur-md" : "border-transparent bg-transparent"
    }`}>
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
        <Link
          href={homeHref}
          className="group -m-2 shrink-0 rounded-sm p-2"
          aria-label={locale === "ar" ? "العودة إلى الصفحة الرئيسية" : "Return to the iPlant home page"}
        >
          <Image
            src="/brand/iplant-wordmark-light.png"
            alt="iPlant"
            width={774}
            height={246}
            priority
            className="h-[32px] w-auto transition-transform duration-300 group-hover:scale-[1.02] md:h-[38px]"
          />
        </Link>

        <nav className={`hidden items-center ${locale === "ar" ? "gap-x-4 min-[1500px]:flex" : "gap-x-5 min-[1220px]:flex"}`} aria-label={content.a11y.mainNavigation ?? "Main navigation"}>
          {desktopItems.map((item) => {
            const href = resolveHref(item.href, locale);
            const external = "external" in item && item.external;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap py-3 text-[0.88rem] transition-colors ${active ? "text-paper" : "text-paper/88 hover:text-aqua"}`}
              >
                {item.label}
                <span className={`absolute inset-x-0 bottom-1 h-px origin-left bg-aqua transition-transform rtl:origin-right ${active ? "scale-x-100" : "scale-x-0"}`} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href={controllerHref}
            target={site.controllerUrl ? "_blank" : undefined}
            rel={site.controllerUrl ? "noopener noreferrer" : undefined}
            className="hidden whitespace-nowrap rounded-full border border-paper/20 px-4 py-2.5 text-[0.82rem] text-paper/82 transition-colors hover:border-aqua hover:text-aqua min-[1500px]:inline-flex"
          >
            {content.controller.label}
          </Link>
          <Link
            href={`/${otherLocale}${pathWithoutLocale}`}
            className="eyebrow rounded-full border border-paper/20 px-3 py-2 text-paper/82 transition-colors hover:border-aqua hover:text-aqua"
            lang={otherLocale}
            aria-label={content.a11y.switchLanguage}
          >
            {otherLocale === "ar" ? "ع" : "EN"}
          </Link>
          <Link
            href={resolveHref(content.navCta.href, locale)}
            className="hidden rounded-full bg-aqua px-5 py-3 text-[0.92rem] font-medium text-ink transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            {content.navCta.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex size-11 items-center justify-center rounded-full border border-paper/20 text-paper ${locale === "ar" ? "min-[1500px]:hidden" : "min-[1220px]:hidden"}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? content.a11y.closeMenu : content.a11y.openMenu}
          >
            <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div ref={menuRef} id="mobile-menu" role="dialog" aria-modal="true" className={`h-[calc(100dvh-76px)] overflow-y-auto border-t border-line-dark bg-ink px-5 pb-20 pt-3 ${locale === "ar" ? "min-[1500px]:hidden" : "min-[1220px]:hidden"}`}>
          <nav className="flex flex-col" aria-label={content.a11y.mobileMenu ?? "Mobile navigation"}>
            {content.nav.map((item) => {
              const href = resolveHref(item.href, locale);
              const external = "external" in item && item.external;
              return (
                <Link
                  key={item.label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`border-b border-line-dark py-4 text-[clamp(1.25rem,5vw,1.8rem)] ${isActive(item.href) ? "text-aqua" : "text-paper"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href={controllerHref} target={site.controllerUrl ? "_blank" : undefined} rel={site.controllerUrl ? "noopener noreferrer" : undefined} className="mt-6 block rounded-sm border border-aqua/30 bg-aqua/[0.06] px-5 py-4 text-paper">
            <span className="block font-medium">{content.controller.title}</span>
            <span className="mt-1 block text-sm text-paper/76">{content.controller.body}</span>
          </Link>
          <Link href={resolveHref(content.navCta.href, locale)} className="mt-6 block rounded-full bg-aqua px-6 py-4 text-center font-medium text-ink">
            {content.navCta.label}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
