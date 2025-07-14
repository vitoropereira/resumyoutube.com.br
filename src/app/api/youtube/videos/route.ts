import { NextRequest, NextResponse } from 'next/server'
import { getLatestVideosFromChannels } from '@/lib/youtube'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's channels
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('channel_id, channel_name, last_checked')
      .eq('user_id', user.id)
      .eq('active', true)

    if (channelsError) {
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const publishedAfter = searchParams.get('publishedAfter')
    const channelId = searchParams.get('channelId')

    let channelIds: string[]
    
    if (channelId) {
      // Get videos from specific channel
      const channel = channels.find(c => c.channel_id === channelId)
      if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }
      channelIds = [channelId]
    } else {
      // Get videos from all user's channels
      channelIds = channels.map(c => c.channel_id)
    }

    // Fetch latest videos from YouTube API
    const videos = await getLatestVideosFromChannels(channelIds, publishedAfter || undefined)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}