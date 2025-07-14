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

    // Get user's active channels
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (channelsError) {
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ message: 'No active channels found' })
    }

    let totalNewVideos = 0
    const processedChannels = []

    for (const channel of channels) {
      try {
        // Get videos published after last check
        const publishedAfter = channel.last_check_at 
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours

        const videos = await getLatestVideosFromChannels([channel.channel_id], publishedAfter)
        
        if (videos.length > 0) {
          // Save new videos to database
          for (const video of videos) {
            // Check if video already exists
            const { data: existingVideo } = await adminSupabase
              .from('processed_videos')
              .select('id')
              .eq('video_id', video.id)
              .eq('user_id', user.id)
              .single()

            if (!existingVideo) {
              // Insert new video
              const { error: insertError } = await adminSupabase
                .from('processed_videos')
                .insert({
                  user_id: user.id,
                  video_id: video.id,
                  title: video.title,
                  description: video.description,
                  channel_id: video.channelId,
                  channel_name: video.channelTitle,
                  published_at: video.publishedAt,
                  duration: video.duration,
                  thumbnail_url: video.thumbnails.medium?.url || video.thumbnails.default?.url,
                  view_count: parseInt(video.viewCount),
                  like_count: parseInt(video.likeCount),
                  comment_count: parseInt(video.commentCount),
                  status: 'pending', // Will be processed later for summary generation
                  created_at: new Date().toISOString()
                })

              if (insertError) {
                console.error('Error inserting video:', insertError)
              } else {
                totalNewVideos++
              }
            }
          }
        }

        // Update channel's last_check_at timestamp
        await adminSupabase
          .from('youtube_channels')
          .update({ 
            last_check_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', channel.id)

        processedChannels.push({
          channel_id: channel.channel_id,
          channel_name: channel.channel_name,
          new_videos: videos.length
        })

      } catch (error) {
        console.error(`Error processing channel ${channel.channel_name}:`, error)
        processedChannels.push({
          channel_id: channel.channel_id,
          channel_name: channel.channel_name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${channels.length} channels`,
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
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active channels
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (channelsError) {
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ available_videos: 0, channels: [] })
    }

    const channelStatus = []
    let totalAvailableVideos = 0

    for (const channel of channels) {
      try {
        const publishedAfter = channel.last_check_at 
          ? new Date(channel.last_check_at).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const videos = await getLatestVideosFromChannels([channel.channel_id], publishedAfter)
        
        channelStatus.push({
          channel_id: channel.channel_id,
          channel_name: channel.channel_name,
          last_check_at: channel.last_check_at,
          available_videos: videos.length
        })

        totalAvailableVideos += videos.length
      } catch (error) {
        channelStatus.push({
          channel_id: channel.channel_id,
          channel_name: channel.channel_name,
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