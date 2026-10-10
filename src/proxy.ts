import { NextResponse, type NextRequest } from "next/server";
import { canonicalAreaUrl } from "@/lib/areas";
import { defaultLocale, LOCALE_COOKIE, languageSwitchEnabled, localizePath, splitLocale } from "@/lib/i18n/config";
import { clearSessionCookies, setSessionCookies } from "@/lib/auth/cookies";
import { renewSession } from "@/lib/auth/proxy-session";
import { hasUnknownSlug } from "@/lib/known-paths";

/**
 * Locale routing. English pages live at "/en/..." internally but are
 * served without a prefix; Gujarati pages are served at "/gu/...".
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);

  // "/en/offers" is not a public URL: send it to "/offers". With the switcher off, so is "/gu/offers".
  if (locale === defaultLocale || (locale && !languageSwitchEnabled)) {
    return NextResponse.redirect(new URL(`${path}${search}`, request.url), 308);
  }

  // Admin panel: English only, never indexed, and the session is renewed here because pages can't set cookies.
  if (path === "/admin" || path.startsWith("/admin/")) {
    const session = await renewSession(request);
    const response = NextResponse.rewrite(new URL(`/${defaultLocale}${path}${search}`, request.url), {
      request: { headers: request.headers },
    });
    if (session === "signed-out") clearSessionCookies(response.cookies);
    else if (session) setSessionCookies(response.cookies, session);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Old-style "/offers?area=x&category=y" links become "/x/offers/y".
  const canonical = canonicalAreaUrl(path, request.nextUrl.searchParams);
  if (canonical) {
    return NextResponse.redirect(new URL(localizePath(locale ?? defaultLocale, canonical), request.url), 308);
  }

  // Unknown slugs go to the catch-all 404 page now, while a 404 status can still be sent.
  // Four segments are deeper than any real route, so only the catch-all matches.
  if (await hasUnknownSlug(path)) {
    return NextResponse.rewrite(new URL(`/${locale ?? defaultLocale}/_/not/found/page`, request.url));
  }

  if (locale) return NextResponse.next();

  // No prefix: honour a saved Gujarati choice, otherwise serve English.
  if (languageSwitchEnabled && request.cookies.get(LOCALE_COOKIE)?.value === "gu") {
    return NextResponse.redirect(new URL(`${localizePath("gu", pathname)}${search}`, request.url));
  }
  return NextResponse.rewrite(new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}${search}`, request.url));
}

export const config = {
  // Skip Next.js internals, API routes and files with an extension (icons, images).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
