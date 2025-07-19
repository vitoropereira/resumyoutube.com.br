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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // pending, processing, completed, failed
    const channelId = searchParams.get('channelId')
    const sort = searchParams.get('sort') || 'published_at' // published_at, created_at, title
    const order = searchParams.get('order') || 'desc' // asc, desc

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build query for global videos with user notifications
    let query = supabase
      .from('user_video_notifications')
      .select(`
        id,
        sent_at,
        is_sent,
        created_at,
        global_processed_videos!inner(
          id,
          video_id,
          video_title,
          video_url,
          video_description,
          transcript,
          summary,
          video_duration,
          published_at,
          processed_at,
          global_youtube_channels!inner(
            id,
            youtube_channel_id,
            channel_name,
            channel_url,
            subscriber_count
          )
        )
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (status) {
      // Map status to is_sent boolean
      if (status === 'sent') {
        query = query.eq('is_sent', true)
      } else if (status === 'pending') {
        query = query.eq('is_sent', false)
      }
    }

    if (channelId) {
      query = query.eq('global_processed_videos.global_channel_id', channelId)
    }

    // Apply sorting - map to global video fields
    let sortField = sort
    if (sort === 'published_at') {
      sortField = 'global_processed_videos.published_at'
    } else if (sort === 'title') {
      sortField = 'global_processed_videos.video_title'
    } else if (sort === 'created_at') {
      sortField = 'created_at'
    }
    
    query = query.order(sortField, { ascending: order === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error: videosError } = await query

    if (videosError) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_video_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (status) {
      if (status === 'sent') {
        countQuery = countQuery.eq('is_sent', true)
      } else if (status === 'pending') {
        countQuery = countQuery.eq('is_sent', false)
      }
    }

    if (channelId) {
      countQuery = countQuery.eq('global_processed_videos.global_channel_id', channelId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json({ error: 'Failed to get video count' }, { status: 500 })
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      notifications: videos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    })

  } catch (error) {
    console.error('Error fetching processed videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processed videos' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Delete the notification record (not the global video)
    const { error: deleteError } = await supabase
      .from('user_video_notifications')
      .delete()
      .eq('id', videoId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Notification deleted successfully' })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}