import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { SummaryList } from '@/components/summaries/summary-list'
import { SummaryFilters } from '@/components/summaries/summary-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

async function getUserData() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all user video notifications with global video info
  const { data: notifications } = await supabase
    .from('user_video_notifications')
    .select(`
      id,
      is_sent,
      sent_at,
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
    .order('created_at', { ascending: false })

  return {
    user: profile,
    notifications: notifications || []
  }
}

export default async function SummariesPage() {
  const { user, notifications } = await getUserData()

  // Calculate stats
  const totalNotifications = notifications.length
  const sentNotifications = notifications.filter(n => n.is_sent).length
  const pendingNotifications = notifications.filter(n => !n.is_sent).length
  const thisMonthNotifications = notifications.filter(n => {
    const created = new Date(n.created_at!)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    {
      title: 'Total de Vídeos',
      value: totalNotifications,
      description: 'Todos os vídeos recebidos',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Este Mês',
      value: thisMonthNotifications,
      description: 'de 30 permitidos',
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: 'Enviados',
      value: sentNotifications,
      description: 'Notificações entregues',
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    {
      title: 'Pendentes',
      value: pendingNotifications,
      description: 'Aguardando envio',
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
  ]

  return (
    <DashboardLayout title="Resumos" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Vídeos</h2>
          <p className="text-gray-600">
            Visualize e gerencie todas as notificações de vídeos recebidas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and List */}
        {notifications.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle>Nenhuma notificação encontrada</CardTitle>
              <CardDescription>
                Inscreva-se em canais do YouTube e aguarde novos vídeos serem processados
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            <SummaryFilters />
            <SummaryList notifications={notifications} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}