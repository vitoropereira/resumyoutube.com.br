import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const channelId = params.id
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'ID do canal é obrigatório' },
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

    // Check if channel belongs to user
    const { data: channel } = await supabase
      .from('youtube_channels')
      .select('id, user_id')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single()

    if (!channel) {
      return NextResponse.json(
        { error: 'Canal não encontrado' },
        { status: 404 }
      )
    }

    // Use admin client to bypass RLS policies for deletion
    const adminClient = createAdminClient()
    
    // Delete channel (this will cascade delete summaries due to foreign key)
    const { error: deleteError } = await adminClient
      .from('youtube_channels')
      .delete()
      .eq('id', channelId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting channel:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao remover canal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Canal removido com sucesso'
    })

  } catch (error) {
    console.error('Channel deletion error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}