import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get video notification statistics
    const { data: stats, error: statsError } = await supabase
      .from('user_video_notifications')
      .select('is_sent, created_at, sent_at')
      .eq('user_id', user.id)

    if (statsError) {
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const totalVideos = stats?.length || 0
    const pendingNotifications = stats?.filter(v => !v.is_sent).length || 0
    const sentNotifications = stats?.filter(v => v.is_sent).length || 0

    // Get videos processed this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thisWeekVideos = stats?.filter(v => v.created_at >= weekAgo).length || 0

    // Get videos processed this month
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const thisMonthVideos = stats?.filter(v => v.created_at >= monthAgo).length || 0

    // Get channel statistics from user subscriptions
    const { data: channelStats, error: channelStatsError } = await supabase
      .from('user_video_notifications')
      .select(`
        global_processed_videos!inner(
          global_channel_id,
          global_youtube_channels!inner(
            id,
            channel_name
          )
        )
      `)
      .eq('user_id', user.id)

    if (channelStatsError) {
      return NextResponse.json({ error: 'Failed to fetch channel statistics' }, { status: 500 })
    }

    // Count videos per channel
    const channelCounts = channelStats?.reduce((acc: any, notification: any) => {
      const channel = notification.global_processed_videos.global_youtube_channels
      if (!acc[channel.id]) {
        acc[channel.id] = {
          channel_id: channel.id,
          channel_name: channel.channel_name,
          count: 0
        }
      }
      acc[channel.id].count++
      return acc
    }, {})

    const topChannels = Object.values(channelCounts || {})
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // Get recent activity (last 7 days)
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = stats?.filter(v => v.created_at.startsWith(dateStr)).length || 0
      
      recentActivity.push({
        date: dateStr,
        count
      })
    }

    return NextResponse.json({
      overview: {
        totalVideos,
        pendingNotifications,
        sentNotifications,
        thisWeekVideos,
        thisMonthVideos
      },
      topChannels,
      recentActivity
    })

  } catch (error) {
    console.error('Error fetching video statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video statistics' },
      { status: 500 }
    )
  }
}