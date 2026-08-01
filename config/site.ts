/**
 * Single source of truth for environment-specific values.
 */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const dirFor = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
export const dirSign = (locale: Locale) => (locale === "ar" ? -1 : 1);

const phoneE164 = "+962795674643";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iplantjo.com";

export const site = {
  name: "iPlant",
  email: "info@iplantjo.com",
  phoneDisplay: "+962 79 567 4643",
  phoneE164,
  location: "Amman, Jordan",
  controllerUrl:
    process.env.NEXT_PUBLIC_CONTROLLER_URL ??
    process.env.NEXT_PUBLIC_CONTROLLER_PORTAL_URL ??
    "",
  iroofUrl: process.env.NEXT_PUBLIC_IROOF_URL ?? "https://www.iroofgr.com",
  siteUrl: baseUrl.replace(/\/$/, ""),
  whatsappUrl: `https://wa.me/${phoneE164.replace(/\D/g, "")}`,
  contactEmail: process.env.CONTACT_EMAIL ?? "info@iplantjo.com",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL ??
    `iPlant website <website@${new URL(baseUrl).hostname.replace(/^www\./, "")}>`,
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? "",
  social: {
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  },
} as const;

/**
 * The opening remains cinematic without delaying the rest of the website.
 * Longer clips receive proportionally more scroll distance.
 */
export const HERO_SCENES = [
  { id: "arid-drop", file: "hero-01-arid-drop", duration: 4.0, vh: 80 },
  { id: "splash-mix", file: "hero-02-splash-mix", duration: 4.0, vh: 80 },
  { id: "water-rise", file: "hero-03-water-rise", duration: 10.01, vh: 120 },
  { id: "hug-grow", file: "hero-04-hug-grow", duration: 10.01, vh: 120 },
  { id: "harvest-pizza", file: "hero-05-harvest-pizza", duration: 10.01, vh: 120 },
] as const;

export type HeroScene = (typeof HERO_SCENES)[number];
