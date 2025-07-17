import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Get user's summary usage data
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select(
        `
        monthly_summary_limit,
        monthly_summary_used,
        extra_summaries,
        summary_reset_date,
        trial_end_date,
        subscription_status
      `
      )
      .eq("id", user.id)
      .single();

    if (userDataError) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user can generate summary
    const { data: canGenerate, error: canGenerateError } = await supabase
      .rpc("can_generate_summary", { user_uuid: user.id });

    if (canGenerateError) {
      console.error("Error checking summary generation:", canGenerateError);
    }

    // Calculate usage stats
    const limit = userData.monthly_summary_limit || 0;
    const used = userData.monthly_summary_used || 0;
    const extraSummaries = userData.extra_summaries || 0;
    const totalAvailable = limit + extraSummaries;
    const percentageUsed = totalAvailable > 0 ? Math.round((used / totalAvailable) * 100) : 0;

    // Calculate days until reset
    const resetDate = userData.summary_reset_date ? new Date(userData.summary_reset_date) : null;
    const daysUntilReset = resetDate 
      ? Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    // Check if user is in trial
    const trialEndDate = userData.trial_end_date ? new Date(userData.trial_end_date) : null;
    const isInTrial = trialEndDate && trialEndDate.getTime() > Date.now();
    const daysLeftInTrial = isInTrial 
      ? Math.ceil((trialEndDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      usage: {
        limit,
        used,
        remaining: Math.max(0, totalAvailable - used),
        extra_summaries: extraSummaries,
        total_available: totalAvailable,
        percentage_used: percentageUsed,
      },
      billing: {
        subscription_status: userData.subscription_status,
        is_in_trial: isInTrial,
        days_left_in_trial: daysLeftInTrial,
        reset_date: userData.summary_reset_date,
        days_until_reset: daysUntilReset,
      },
      can_generate_summary: canGenerate || false,
    });
  } catch (error) {
    console.error("Error fetching summary usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary usage" },
      { status: 500 }
    );
  }
}