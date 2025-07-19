import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BusinessType, ContentInterest, SummaryFrequency } from "@/lib/types";

interface OnboardingData {
  phone_number?: string;
  whatsapp_validated?: boolean;
  business_type?: BusinessType;
  content_interest?: ContentInterest;
  summary_frequency?: SummaryFrequency;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: OnboardingData = await request.json();

    // Validate data types
    if (data.business_type && !['creator', 'business', 'personal', 'agency'].includes(data.business_type)) {
      return NextResponse.json({ error: "Invalid business_type" }, { status: 400 });
    }

    if (data.content_interest && !['tech', 'business', 'entertainment', 'education', 'lifestyle', 'news', 'other'].includes(data.content_interest)) {
      return NextResponse.json({ error: "Invalid content_interest" }, { status: 400 });
    }

    if (data.summary_frequency && !['daily', 'weekly', 'monthly', 'realtime'].includes(data.summary_frequency)) {
      return NextResponse.json({ error: "Invalid summary_frequency" }, { status: 400 });
    }

    // Update user profile with provided data
    const { error: updateError } = await supabase
      .from("users")
      .update(data)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return NextResponse.json(
        { error: "Failed to save onboarding data" },
        { status: 500 }
      );
    }

    // Get updated user profile
    const { data: updatedProfile, error: profileError } = await supabase
      .from("users")
      .select("phone_number, whatsapp_validated, business_type, content_interest, summary_frequency")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching updated profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch updated profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error("Error in onboarding save API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}