import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get video statistics
    const { data: stats, error: statsError } = await supabase
      .from('processed_videos')
      .select('status, created_at, sent_to_user')
      .eq('user_id', user.id)

    if (statsError) {
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const totalVideos = stats?.length || 0
    const pendingVideos = stats?.filter(v => v.status === 'pending').length || 0
    const processingVideos = stats?.filter(v => v.status === 'processing').length || 0
    const completedVideos = stats?.filter(v => v.status === 'completed').length || 0
    const failedVideos = stats?.filter(v => v.status === 'failed').length || 0
    const sentToUser = stats?.filter(v => v.sent_to_user).length || 0

    // Get videos processed this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thisWeekVideos = stats?.filter(v => v.created_at >= weekAgo).length || 0

    // Get videos processed this month
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const thisMonthVideos = stats?.filter(v => v.created_at >= monthAgo).length || 0

    // Get channel statistics
    const { data: channelStats, error: channelStatsError } = await supabase
      .from('processed_videos')
      .select('channel_id, channel_name')
      .eq('user_id', user.id)

    if (channelStatsError) {
      return NextResponse.json({ error: 'Failed to fetch channel statistics' }, { status: 500 })
    }

    // Count videos per channel
    const channelCounts = channelStats?.reduce((acc: any, video: any) => {
      if (!acc[video.channel_id]) {
        acc[video.channel_id] = {
          channel_id: video.channel_id,
          channel_name: video.channel_name,
          count: 0
        }
      }
      acc[video.channel_id].count++
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
        pendingVideos,
        processingVideos,
        completedVideos,
        failedVideos,
        sentToUser,
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