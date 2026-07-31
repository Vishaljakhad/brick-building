import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const secureCookie = url.protocol === "https:";
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
  });
  const role = (token?.role as string) || "";

  if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/owner") && role !== "OWNER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
