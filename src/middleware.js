import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icon-192x192.png|icon-512x512.png).*)",
  ],
};
