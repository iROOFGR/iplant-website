import en from "@/content/content.en.json";
import ar from "@/content/content.ar.json";
import { site, type Locale } from "@/config/site";

export type Content = typeof en;

const dictionaries = { en, ar } as const;

/**
 * Content JSON stores link tokens rather than literal URLs so the same file
 * works across environments. Resolve them once, here.
 */
const TOKENS: Record<string, string> = {
  IROOF_URL: site.iroofUrl,
  WHATSAPP_URL: site.whatsappUrl,
  MAILTO_URL: `mailto:${site.email}`,
  CONTROLLER_URL: site.controllerUrl,
};

export function resolveHref(href: string, locale: Locale): string {
  if (href === "CONTROLLER_URL") {
    return site.controllerUrl || `/${locale}/contact?type=controller-access`;
  }
  const token = TOKENS[href];
  if (token) return token;
  // Internal routes are locale-prefixed; external and anchor links are not.
  if (href.startsWith("/")) return `/${locale}${href}`;
  return href;
}

export function isExternal(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:") || href in TOKENS;
}

export function getContent(locale: Locale): Content {
  // The Arabic file mirrors the English shape exactly, so this cast is safe
  // and keeps every consumer typed against a single Content shape.
  return dictionaries[locale] as Content;
}
