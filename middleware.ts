import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Permanent redirect apex → www so crawlers and users land on the canonical host.
 * Vercel may already redirect at the edge; this keeps behavior consistent in-app.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (host === "brandcure.in") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "www.brandcure.in";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
