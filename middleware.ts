import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { KIOSK_COOKIE_NAME } from "@/lib/device-session";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const kioskCookie = req.cookies.get(KIOSK_COOKIE_NAME)?.value;

  if (pathname === "/kiosk" || pathname.startsWith("/kiosk/claim") || pathname.startsWith("/api/kids")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/kids")) {
    if (kioskCookie) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/kiosk";
    return NextResponse.redirect(url);
  }

  if (pathname !== "/") {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/inbox";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/kids/:path*", "/kiosk", "/kiosk/claim", "/api/kids/:path*"],
};

