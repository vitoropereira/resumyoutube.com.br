import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import {
  isPublicRoute,
  isOnboardingRoute,
  isAuthRoute,
  hasCompletedOnboarding,
  getOnboardingStep,
} from "@/lib/onboarding-helpers";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes, API routes, and static files
  if (
    isPublicRoute(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    let response = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If user is not authenticated and trying to access protected route
    if (error || !user) {
      if (!isAuthRoute(pathname) && !isPublicRoute(pathname)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return response;
    }

    // If user is authenticated but on auth routes, redirect to dashboard
    if (isAuthRoute(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Get user profile to check onboarding status
    const { data: profile } = await supabase
      .from("users")
      .select(
        "whatsapp_validated, business_type, content_interest, summary_frequency, subscription_status"
      )
      .eq("id", user.id)
      .single();

    // If user hasn't completed onboarding and not on onboarding route
    if (
      profile &&
      !hasCompletedOnboarding(profile) &&
      !isOnboardingRoute(pathname)
    ) {
      const onboardingStep = getOnboardingStep(profile);
      return NextResponse.redirect(new URL(onboardingStep, request.url));
    }

    // If user completed onboarding but still on onboarding route, redirect to dashboard
    if (
      profile &&
      hasCompletedOnboarding(profile) &&
      isOnboardingRoute(pathname)
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
