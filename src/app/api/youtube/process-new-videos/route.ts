import { NextRequest, NextResponse } from 'next/server'
import { getLatestVideosFromChannels } from '@/lib/youtube'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get global channels to check using the global function
    const { data: channelsToCheck, error: channelsError } = await adminSupabase
      .rpc('get_global_channels_to_check', { check_limit: 50 })

    if (channelsError) {
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
    }

    if (!channelsToCheck || channelsToCheck.length === 0) {
      return NextResponse.json({ message: 'No channels to check' })
    }

    let totalNewVideos = 0
    const processedChannels = []

    for (const channel of channelsToCheck) {
      try {
        // Get videos published after last check
        const publishedAfter = channel.last_check_at 
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours

        const videos = await getLatestVideosFromChannels([channel.youtube_channel_id], publishedAfter)
        
        if (videos.length > 0) {
          // Process each new video using the global function
          for (const video of videos) {
            // Check if video already exists globally
            const { data: existingVideo } = await adminSupabase
              .from('global_processed_videos')
              .select('id')
              .eq('video_id', video.id)
              .single()

            if (!existingVideo) {
              // Process new video globally (creates video + notifications for all users)
              const { data: videoUuid, error: processError } = await adminSupabase
                .rpc('process_global_video', {
                  channel_uuid: channel.channel_uuid,
                  video_id: video.id,
                  video_title: video.title,
                  video_url: `https://youtube.com/watch?v=${video.id}`,
                  video_description: video.description,
                  transcript_text: null, // Will be populated later
                  summary_text: null, // Will be populated later
                  video_duration: video.duration,
                  published_at: video.publishedAt
                })

              if (processError) {
                console.error('Error processing global video:', processError)
              } else {
                totalNewVideos++
              }
            }
          }
        }

        processedChannels.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          new_videos: videos.length,
          total_users: channel.total_users
        })

      } catch (error) {
        console.error(`Error processing channel ${channel.channel_name}:`, error)
        processedChannels.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${channelsToCheck.length} channels`,
      total_new_videos: totalNewVideos,
      processed_channels: processedChannels
    })

  } catch (error) {
    console.error('Error processing new videos:', error)
    return NextResponse.json(
      { error: 'Failed to process new videos' },
      { status: 500 }
    )
  }
}

// GET endpoint to check for new videos without processing
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active channel subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_channel_subscriptions')
      .select(`
        id,
        is_active,
        global_youtube_channels!inner(
          id,
          youtube_channel_id,
          channel_name,
          last_check_at
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (subscriptionsError) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ available_videos: 0, channels: [] })
    }

    const channelStatus = []
    let totalAvailableVideos = 0

    for (const subscription of subscriptions) {
      try {
        const channel = subscription.global_youtube_channels
        const publishedAfter = channel.last_check_at 
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const videos = await getLatestVideosFromChannels([channel.youtube_channel_id], publishedAfter)
        
        channelStatus.push({
          channel_id: channel.youtube_channel_id,
          channel_name: channel.channel_name,
          last_check_at: channel.last_check_at,
          available_videos: videos.length
        })

        totalAvailableVideos += videos.length
      } catch (error) {
        channelStatus.push({
          channel_id: subscription.global_youtube_channels.youtube_channel_id,
          channel_name: subscription.global_youtube_channels.channel_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      available_videos: totalAvailableVideos,
      channels: channelStatus
    })

  } catch (error) {
    console.error('Error checking for new videos:', error)
    return NextResponse.json(
      { error: 'Failed to check for new videos' },
      { status: 500 }
    )
  }
}