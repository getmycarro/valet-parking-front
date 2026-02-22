import { NextRequest, NextResponse } from "next/server";

// Duplicated here because Edge Runtime cannot import client-side modules
const ROLE_ROUTE_ACCESS: Record<string, string[]> = {
  "/admin/dashboard": ["admin", "manager"],
  "/admin/employees": ["admin"],
  "/admin/billing": ["admin", "manager"],
  "/admin/companies": ["super_admin"],
  "/admin/users": ["super_admin"],
  "/attendant/dashboard": ["attendant"],
};

const ROLE_DEFAULT_REDIRECT: Record<string, string> = {
  super_admin: "/admin/companies",
  admin: "/admin/dashboard",
  manager: "/admin/dashboard",
  attendant: "/attendant/dashboard",
};

const API_ROLE_MAP: Record<string, string> = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ATTENDANT: "attendant",
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("valet_parking_token")?.value;

  // If user is logged in and hits /login or /, redirect to their dashboard
  if (pathname === "/login" || pathname === "/") {
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload?.role) {
        const frontendRole =
          API_ROLE_MAP[payload.role as string] || "attendant";
        const redirectTo = ROLE_DEFAULT_REDIRECT[frontendRole];
        if (redirectTo) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Protected routes: must have token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode role from JWT
  const payload = decodeJwtPayload(token);
  if (!payload?.role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const frontendRole = API_ROLE_MAP[payload.role as string] || "attendant";

  // Find matching route rule
  const matchedRoute = Object.keys(ROLE_ROUTE_ACCESS).find(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (matchedRoute) {
    const allowedRoles = ROLE_ROUTE_ACCESS[matchedRoute];
    if (!allowedRoles.includes(frontendRole)) {
      const redirectTo = ROLE_DEFAULT_REDIRECT[frontendRole] || "/login";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/attendant/:path*", "/login", "/"],
};
