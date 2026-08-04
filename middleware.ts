import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const middleware = auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
