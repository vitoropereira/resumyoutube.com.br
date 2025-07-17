import { NextResponse } from "next/server";
import { getLatestVideosFromChannels } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateVideoSummary } from "@/lib/openai";

export async function POST() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get global channels to check using direct query
    const { data: channelsToCheck, error: channelsError } = await adminSupabase
      .from("global_youtube_channels")
      .select(
        `
        id,
        youtube_channel_id,
        channel_name,
        last_video_id,
        last_check_at,
        subscriber_count,
        user_channel_subscriptions!inner(
          user_id,
          is_active
        )
      `
      )
      .eq("is_active", true)
      .eq("user_channel_subscriptions.is_active", true)
      .order("last_check_at", { ascending: true })
      .limit(50);
    console.log("Fetched channels to check:", channelsToCheck);
    console.log("Processing new videos...");
    if (channelsError) {
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: 500 }
      );
    }

    if (!channelsToCheck || channelsToCheck.length === 0) {
      return NextResponse.json({ message: "No channels to check" });
    }

    let totalNewVideos = 0;
    const processedChannels = [];

    for (const channel of channelsToCheck) {
      try {
        // Get videos published after last check
        const publishedAfter = channel.last_check_at
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours

        const videos = await getLatestVideosFromChannels(
          [channel.youtube_channel_id],
          publishedAfter,
          true
        );
        console.log(
          `Found ${videos.length} new videos for channel ${channel.channel_name}`
        );

        if (videos.length > 0) {
          // Process each new video using the global function
          for (const video of videos) {
            // Check if video already exists globally
            const { data: existingVideo } = await adminSupabase
              .from("global_processed_videos")
              .select("id")
              .eq("video_id", video.id)
              .single();

            if (!existingVideo) {
              console.log(`Processing new video: ${video.title} (${video.id})`);
              console.log(
                `Transcript available: ${video.transcript ? "Yes" : "No"}`
              );

              // Generate summary with OpenAI
              console.log(`Generating summary for video: ${video.id}`);
              const summary = await generateVideoSummary({
                title: video.title,
                description: video.description,
                transcript: video.transcript,
                channelName: channel.channel_name,
                duration: video.duration
              });

              if (summary) {
                console.log(`✅ Summary generated: ${summary.length} characters`);
              } else {
                console.log(`❌ Failed to generate summary for video: ${video.id}`);
              }

              // Insert video into global_processed_videos
              const { data: insertedVideo, error: insertError } =
                await adminSupabase
                  .from("global_processed_videos")
                  .insert({
                    global_channel_id: channel.id,
                    video_id: video.id,
                    video_title: video.title,
                    video_url: `https://youtube.com/watch?v=${video.id}`,
                    video_description: video.description,
                    transcript: video.transcript || null,
                    summary: summary || null,
                    video_duration: video.duration,
                    published_at: video.publishedAt,
                  })
                  .select("id")
                  .single();

              if (insertError) {
                console.error("Error inserting global video:", insertError);
              } else {
                console.log(`✅ Video inserted with ID: ${insertedVideo.id}`);

                // Create notifications for users who can generate summaries
                const { data: subscribers } = await adminSupabase
                  .from("user_channel_subscriptions")
                  .select("user_id")
                  .eq("global_channel_id", channel.id)
                  .eq("is_active", true);

                if (subscribers && subscribers.length > 0) {
                  const validNotifications = [];
                  let skippedUsers = 0;

                  // Check each user's summary quota before creating notification
                  for (const sub of subscribers) {
                    const { data: canGenerate } = await adminSupabase
                      .rpc("can_generate_summary", { user_uuid: sub.user_id });

                    if (canGenerate) {
                      validNotifications.push({
                        user_id: sub.user_id,
                        global_video_id: insertedVideo.id,
                        is_sent: false,
                      });

                      // Increment summary usage for this user
                      await adminSupabase
                        .rpc("increment_summary_usage", { user_uuid: sub.user_id });
                    } else {
                      skippedUsers++;
                      console.log(`⚠️ User ${sub.user_id} has reached summary limit`);
                    }
                  }

                  if (validNotifications.length > 0) {
                    const { error: notificationError } = await adminSupabase
                      .from("user_video_notifications")
                      .insert(validNotifications);

                    if (notificationError) {
                      console.error(
                        "Error creating notifications:",
                        notificationError
                      );
                    } else {
                      console.log(
                        `✅ Created ${validNotifications.length} notifications (${skippedUsers} users skipped due to limits)`
                      );
                    }
                  } else {
                    console.log("❌ No users can receive summaries (all have reached limits)");
                  }
                }

                // Update channel's last_video_id and last_check_at
                await adminSupabase
                  .from("global_youtube_channels")
                  .update({
                    last_video_id: video.id,
                    last_check_at: new Date().toISOString(),
                  })
                  .eq("id", channel.id);

                totalNewVideos++;
              }
            }
          }
        }

        processedChannels.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          new_videos: videos.length,
          total_users: channel.user_channel_subscriptions.length,
        });
      } catch (error) {
        console.error(
          `Error processing channel ${channel.channel_name}:`,
          error
        );
        processedChannels.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${channelsToCheck.length} channels`,
      total_new_videos: totalNewVideos,
      processed_channels: processedChannels,
    });
  } catch (error) {
    console.error("Error processing new videos:", error);
    return NextResponse.json(
      { error: "Failed to process new videos" },
      { status: 500 }
    );
  }
}

// GET endpoint to check for new videos without processing
export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active channel subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("user_channel_subscriptions")
      .select(
        `
        id,
        is_active,
        global_youtube_channels!inner(
          id,
          youtube_channel_id,
          channel_name,
          last_check_at
        )
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (subscriptionsError) {
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ available_videos: 0, channels: [] });
    }

    const channelStatus = [];
    let totalAvailableVideos = 0;

    for (const subscription of subscriptions) {
      try {
        const channel = subscription.global_youtube_channels;
        const publishedAfter = channel.last_check_at
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const videos = await getLatestVideosFromChannels(
          [channel.youtube_channel_id],
          publishedAfter,
          true
        );

        channelStatus.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          last_check_at: channel.last_check_at,
          available_videos: videos.length,
        });

        totalAvailableVideos += videos.length;
      } catch (error) {
        channelStatus.push({
          channel_id: subscription.global_youtube_channels.youtube_channel_id,
          channel_name: subscription.global_youtube_channels.channel_name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      available_videos: totalAvailableVideos,
      channels: channelStatus,
    });
  } catch (error) {
    console.error("Error checking for new videos:", error);
    return NextResponse.json(
      { error: "Failed to check for new videos" },
      { status: 500 }
    );
  }
}
