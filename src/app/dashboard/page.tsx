import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Youtube, 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

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

  // Get active subscriptions count
  const { count: channelsCount } = await supabase
    .from('user_channel_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Get notifications count
  const { count: summariesCount } = await supabase
    .from('user_video_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get recent notifications
  const { data: recentNotifications } = await supabase
    .from('user_video_notifications')
    .select(`
      id,
      is_sent,
      sent_at,
      created_at,
      global_processed_videos!inner(
        id,
        video_title,
        video_url,
        published_at,
        global_youtube_channels!inner(
          channel_name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    user: profile,
    channelsCount: channelsCount || 0,
    summariesCount: summariesCount || 0,
    recentNotifications: recentNotifications || []
  }
}

export default async function DashboardPage() {
  const { user, channelsCount, summariesCount, recentNotifications } = await getUserData()

  const stats = [
    {
      name: 'Canais Monitorados',
      value: channelsCount,
      max: user?.max_channels || 3,
      icon: Youtube,
      href: '/dashboard/channels'
    },
    {
      name: 'Resumos Gerados',
      value: summariesCount,
      icon: FileText,
      href: '/dashboard/summaries'
    },
    {
      name: 'Status da Assinatura',
      value: user?.subscription_status === 'active' ? 'Ativo' : 'Inativo',
      icon: user?.subscription_status === 'active' ? CheckCircle : XCircle,
      href: '/dashboard/billing'
    }
  ]

  return (
    <DashboardLayout title="Dashboard" user={user}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Acompanhe seus canais do YouTube e receba resumos inteligentes via WhatsApp
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' && 'max' in stat ? 
                      `${stat.value}/${stat.max}` : 
                      stat.value
                    }
                  </div>
                  <Link href={stat.href}>
                    <Button variant="link" size="sm" className="px-0 text-blue-600">
                      Ver detalhes →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/channels">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Canal
                </Button>
              </Link>
              <Link href="/dashboard/summaries">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Resumos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
Notificações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
Nenhuma notificação ainda
                </h3>
                <p className="mt-1 text-sm text-gray-500">
Adicione um canal para começar a receber notificações automáticas
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/channels">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Canal
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotifications.map((notification) => {
                  const video = notification.global_processed_videos
                  const channel = video.global_youtube_channels
                  return (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{video.video_title}</h4>
                      <p className="text-sm text-gray-500">
                        {channel.channel_name} • {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.is_sent 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.is_sent ? 'Enviado' : 'Pendente'}
                    </span>
                  </div>
                  )
                })}
                <div className="text-center">
                  <Link href="/dashboard/summaries">
                    <Button variant="outline">Ver Todas as Notificações</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}