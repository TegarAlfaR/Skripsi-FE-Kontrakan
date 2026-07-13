import { NextResponse } from "next/server";

function getRoleFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    );
    return decoded.role;
  } catch (error) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/units/");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = getRoleFromToken(token);

  const roleRoutes = {
    owner: ["/dashboard-owner"],
    admin: ["/dashboard-admin"],
    tenant: ["/booking", "/booking-history"],
  };

  for (const [routeRole, prefixes] of Object.entries(roleRoutes)) {
    const isRestricted = prefixes.some((p) => pathname.startsWith(p));
    if (isRestricted && role !== routeRole) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icon-192x192.png|icon-512x512.png).*)",
  ],
};
