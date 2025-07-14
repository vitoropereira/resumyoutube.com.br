import { createClient } from "@/lib/supabase/server";
import { createUserProfileAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Auth callback started");

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Callback params:", { code: !!code, next });

  if (code) {
    try {
      const supabase = await createClient();

      console.log("Exchanging code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code:", error);
        return NextResponse.redirect(
          `${origin}/dashboard?error=auth_error&error_description=${encodeURIComponent(
            error.message
          )}`
        );
      }

      if (data.user) {
        console.log("User authenticated:", data.user.id);

        // Create or update user profile for social login using admin client
        const userData = {
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Usuário",
          phone_number: null,
          email: data.user.email,
        };

        console.log("Creating profile with admin client. User data:", userData);

        const result = await createUserProfileAdmin(data.user.id, userData);

        if (!result.success) {
          console.error(
            "Error creating profile with admin client:",
            result.error
          );

          return NextResponse.redirect(
            `${origin}/dashboard?error=server_error&error_code=profile_creation&error_description=${encodeURIComponent(
              "Database error saving new user"
            )}`
          );
        }

        console.log("Profile created successfully, redirecting to dashboard");

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (error) {
      console.error("Unexpected error in callback:", error);
      return NextResponse.redirect(
        `${origin}/dashboard?error=server_error&error_code=unexpected_failure&error_description=${encodeURIComponent(
          "Database error saving new user"
        )}`
      );
    }
  }

  console.log("No code provided, redirecting to error page");
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
