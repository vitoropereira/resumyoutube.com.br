import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getChannelInfo, extractChannelIdFromUrl } from '@/lib/youtube'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL do canal é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get user profile to check limits
    const { data: profile } = await supabase
      .from('users')
      .select('max_channels')
      .eq('id', user.id)
      .single()

    // Check current channel count
    const { count: currentCount } = await supabase
      .from('youtube_channels')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (currentCount && currentCount >= (profile?.max_channels || 3)) {
      return NextResponse.json(
        { error: 'Limite de canais atingido' },
        { status: 400 }
      )
    }

    // Extract channel ID from URL
    const channelId = extractChannelIdFromUrl(url)
    if (!channelId) {
      return NextResponse.json(
        { error: 'URL do canal inválida' },
        { status: 400 }
      )
    }

    // Check if channel already exists
    const { data: existingChannel } = await supabase
      .from('youtube_channels')
      .select('id')
      .eq('user_id', user.id)
      .eq('channel_id', channelId)
      .single()

    if (existingChannel) {
      return NextResponse.json(
        { error: 'Canal já foi adicionado' },
        { status: 400 }
      )
    }

    // Fetch channel info from YouTube API
    const channelInfo = await getChannelInfo(url)
    
    if (!channelInfo) {
      return NextResponse.json(
        { error: 'Canal não encontrado no YouTube' },
        { status: 404 }
      )
    }

    // Prepare channel data according to youtube_channels table structure
    const channelData = {
      user_id: user.id,
      channel_id: channelInfo.id,
      channel_name: channelInfo.title,
      channel_url: url,
      channel_description: channelInfo.description,
      subscriber_count: parseInt(channelInfo.statistics.subscriberCount),
      video_count: parseInt(channelInfo.statistics.videoCount),
      is_active: true
    }

    console.log('Attempting to insert channel with data:', channelData)
    console.log('User ID:', user.id)

    // Use admin client to bypass RLS policies
    const adminClient = createAdminClient()
    
    // Insert channel using admin client
    const { data: newChannel, error: insertError } = await adminClient
      .from('youtube_channels')
      .insert(channelData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting channel:', {
        error: insertError,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      return NextResponse.json(
        { error: `Erro ao adicionar canal: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Canal adicionado com sucesso',
      channel: newChannel
    })

  } catch (error) {
    console.error('Channel creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get user's channels using admin client
    const { data: channels, error: channelsError } = await adminSupabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (channelsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar canais' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      channels: channels || []
    })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json(
        { error: 'ID do canal é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Delete channel using admin client
    const { error: deleteError } = await adminSupabase
      .from('youtube_channels')
      .delete()
      .eq('id', channelId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Erro ao remover canal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Canal removido com sucesso'
    })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

