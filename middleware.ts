import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Paths guarded by auth. Route groups like (app) are organizational only —
// they don't appear in the URL — so the matcher below lists the real paths.
const PROTECTED_PATHS = [
  "/dashboard",
  "/connect",
  "/events",
  "/knowledge",
  "/recommend",
  "/intelligence",
  "/consent",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() (not getSession()) revalidates the token against
  // Supabase Auth on every request — this is what actually refreshes the
  // session and is safe to trust in server code.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/connect/:path*",
    "/events/:path*",
    "/knowledge/:path*",
    "/recommend/:path*",
    "/intelligence/:path*",
    "/consent/:path*",
  ],
};
