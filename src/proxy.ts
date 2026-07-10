import { NextResponse, type NextRequest } from "next/server";

/* Next 16: middleware was renamed to proxy. Root and legacy hash-SPA paths → /ar */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ar", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
