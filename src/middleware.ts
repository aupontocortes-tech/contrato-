import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redireciona a raiz na borda (Edge), sem acionar layout/página Node
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
