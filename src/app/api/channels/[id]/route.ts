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

    // Check if subscription belongs to user
    const { data: subscription } = await supabase
      .from('user_channel_subscriptions')
      .select('id, user_id')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Use admin client to bypass RLS policies for deletion
    const adminClient = createAdminClient()
    
    // Deactivate user subscription (don't delete global channel)
    const { error: deleteError } = await adminClient
      .from('user_channel_subscriptions')
      .update({ is_active: false })
      .eq('id', channelId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deactivating subscription:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao cancelar inscrição' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Inscrição cancelada com sucesso'
    })

  } catch (error) {
    console.error('Subscription deactivation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}