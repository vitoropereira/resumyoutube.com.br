import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    
    // Verificar autenticação N8N
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (token !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Buscar notificações pendentes
    const { data: pendingNotifications, error } = await adminSupabase
      .from('user_video_notifications')
      .select(`
        id,
        user_id,
        global_processed_videos!inner(
          id,
          video_title,
          video_url,
          summary,
          global_youtube_channels!inner(
            channel_name
          )
        ),
        users!inner(
          phone_number,
          name,
          whatsapp_validated
        )
      `)
      .eq('is_sent', false)
      .eq('users.whatsapp_validated', true)
      .limit(20)

    if (error) {
      console.error('Error fetching pending notifications:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return NextResponse.json({ 
        message: 'No pending notifications found',
        notifications_sent: 0 
      })
    }

    let notificationsSent = 0
    const results = []

    // Processar cada notificação
    for (const notification of pendingNotifications) {
      try {
        const video = notification.global_processed_videos
        const channel = video.global_youtube_channels
        const user = notification.users

        // Simular envio WhatsApp (substituir por API real)
        const whatsappMessage = `
🎬 *Novo vídeo: ${video.video_title}*

📺 Canal: ${channel.channel_name}

📝 *Resumo:*
${video.summary?.substring(0, 500)}...

🔗 Ver vídeo: ${video.video_url}

---
Resume YouTube 🤖
        `.trim()

        // TODO: Implementar API real do WhatsApp
        const whatsappResult = await simulateWhatsAppSend(
          user.phone_number,
          whatsappMessage
        )

        if (whatsappResult.success) {
          // Marcar como enviado
          await adminSupabase
            .from('user_video_notifications')
            .update({
              is_sent: true,
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)

          notificationsSent++
          results.push({
            notification_id: notification.id,
            user_phone: user.phone_number,
            video_title: video.video_title,
            status: 'sent'
          })
        } else {
          results.push({
            notification_id: notification.id,
            user_phone: user.phone_number,
            video_title: video.video_title,
            status: 'failed',
            error: whatsappResult.error
          })
        }

      } catch (notificationError) {
        console.error('Error processing notification:', notificationError)
        results.push({
          notification_id: notification.id,
          status: 'failed',
          error: 'Processing error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${pendingNotifications.length} notifications`,
      notifications_sent: notificationsSent,
      results
    })

  } catch (error) {
    console.error('Error in send-pending WhatsApp:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simular envio WhatsApp (substituir por API real)
async function simulateWhatsAppSend(phoneNumber: string, message: string) {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Simular sucesso/falha (95% sucesso)
  const success = Math.random() > 0.05
  
  if (success) {
    console.log(`📱 WhatsApp enviado para ${phoneNumber}:`, message.substring(0, 100) + '...')
    return { success: true }
  } else {
    console.log(`❌ Falha ao enviar WhatsApp para ${phoneNumber}`)
    return { success: false, error: 'WhatsApp API error' }
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'WhatsApp send-pending endpoint',
    method: 'Use POST to send pending notifications'
  })
}