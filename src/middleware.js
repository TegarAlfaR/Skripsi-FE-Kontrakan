import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // 1. Tentukan halaman mana saja yang bebas diakses tanpa login (Bypass)
  // Tambahkan rute lain di sini jika ada (misal: '/register', '/about')
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  // 2. Jika token tidak ada dan user mencoba mengakses halaman selain bypass di atas
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 3. Atur matcher agar memfilter seluruh halaman di web kamu
export const config = {
  /*
   * Matcher ini akan mencocokkan semua rute halaman KECUALI:
   * - api (rute API internal Next.js)
   * - _next/static (berkas statis seperti CSS/JS)
   * - _next/image (optimasi gambar Next.js)
   * - favicon.ico, sitemap.xml, robots.txt (berkas metadata browser)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
