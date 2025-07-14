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

    // Build query
    let query = supabase
      .from('processed_videos')
      .select(`
        *,
        youtube_channels!inner(
          channel_name,
          channel_id,
          thumbnail_url
        )
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (channelId) {
      query = query.eq('channel_id', channelId)
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error: videosError } = await query

    if (videosError) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('processed_videos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    if (channelId) {
      countQuery = countQuery.eq('channel_id', channelId)
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
      videos: videos || [],
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
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // Delete the video record
    const { error: deleteError } = await supabase
      .from('processed_videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Video deleted successfully' })

  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}