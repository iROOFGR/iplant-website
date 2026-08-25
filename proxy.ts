import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/config/site";

/** Every page lives under /en or /ar; bare public paths resolve to /en. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  // English is the primary design language: the layout, typography and motion
  // are composed for it, and Arabic is the mirrored counterpart. So we always
  // land on /en and let the visitor opt into Arabic via the switcher, rather
  // than negotiating from Accept-Language and sending MENA visitors to a
  // version of the site they did not ask for.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  // Locale URLs are the permanent public architecture. A 308 preserves the
  // request method while consolidating indexing and links on /en or /ar.
  return NextResponse.redirect(url, 308);
}

export const config = {
  // API routes must never receive a locale redirect: doing so turns a valid
  // contact-form POST into a GET request for a non-existent localized route.
  matcher: ["/((?!api|_next|media|brand|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
