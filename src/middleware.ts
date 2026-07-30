import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const user = req.auth?.user;

  if (path.startsWith("/dashboard/admin") && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/owner") && user?.role !== "OWNER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/customer") && user?.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
