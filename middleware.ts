import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/config/site";

/**
 * Every page lives under /en or /ar. Bare paths are negotiated from the
 * Accept-Language header and redirected once.
 */
export function middleware(request: NextRequest) {
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
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|media|brand|favicon.ico|robots.txt|sitemap.xml).*)"],
};
