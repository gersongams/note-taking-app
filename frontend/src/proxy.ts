import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/((?!auth|api|_next|asssets|.*\\..*|favicon.ico).*)"],
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
