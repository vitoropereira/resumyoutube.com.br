import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { hasCompletedOnboarding, getOnboardingStep } from '@/lib/onboarding-helpers'
import { UsageMeter } from '@/components/dashboard/usage-meter'
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
  XCircle,
  Activity,
  Calendar,
  Send,
  AlertCircle,
  Crown,
  Star
} from 'lucide-react'
import Link from 'next/link'

async function getUserData() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile with subscription data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user completed onboarding
  if (profile && !hasCompletedOnboarding(profile)) {
    const onboardingStep = getOnboardingStep(profile)
    redirect(onboardingStep)
  }

  // Get active subscriptions count
  const { count: channelsCount } = await supabase
    .from('user_channel_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Get total notifications count
  const { count: totalNotifications } = await supabase
    .from('user_video_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get sent notifications count
  const { count: sentNotifications } = await supabase
    .from('user_video_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_sent', true)

  // Get pending notifications count
  const { count: pendingNotifications } = await supabase
    .from('user_video_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_sent', false)

  // Get today's notifications count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayNotifications } = await supabase
    .from('user_video_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Get user's channels with details
  const { data: userChannels } = await supabase
    .from('user_channel_subscriptions')
    .select(`
      id,
      is_active,
      subscribed_at,
      global_youtube_channels!inner(
        id,
        channel_name,
        subscriber_count,
        video_count,
        last_check_at
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })

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
        video_duration,
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
    subscription,
    channelsCount: channelsCount || 0,
    totalNotifications: totalNotifications || 0,
    sentNotifications: sentNotifications || 0,
    pendingNotifications: pendingNotifications || 0,
    todayNotifications: todayNotifications || 0,
    userChannels: userChannels || [],
    recentNotifications: recentNotifications || []
  }
}

export default async function DashboardPage() {
  const { 
    user, 
    subscription,
    channelsCount, 
    totalNotifications, 
    sentNotifications, 
    pendingNotifications, 
    todayNotifications,
    userChannels,
    recentNotifications 
  } = await getUserData()

  // Calculate subscription plan info
  const planName = subscription?.plan_name || (user?.subscription_status === 'trialing' ? 'Trial' : 'Free')
  const isOnTrial = user?.subscription_status === 'trialing'
  const trialEndDate = user?.trial_end_date ? new Date(user.trial_end_date) : null
  const trialDaysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  const stats = [
    {
      name: 'Canais Monitorados',
      value: channelsCount,
      description: 'Ilimitados',
      icon: Youtube,
      href: '/dashboard/channels',
      color: 'text-blue-600'
    },
    {
      name: 'Resumos Totais',
      value: totalNotifications,
      description: 'Todos os tempos',
      icon: FileText,
      href: '/dashboard/summaries',
      color: 'text-green-600'
    },
    {
      name: 'Enviados Hoje',
      value: todayNotifications,
      description: 'Últimas 24h',
      icon: Send,
      href: '/dashboard/summaries',
      color: 'text-purple-600'
    },
    {
      name: 'Pendentes',
      value: pendingNotifications,
      description: 'Aguardando envio',
      icon: AlertCircle,
      href: '/dashboard/summaries',
      color: 'text-orange-600'
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
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-600">
              Acompanhe seus canais do YouTube e receba resumos inteligentes via WhatsApp
            </p>
            {isOnTrial && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                <Crown className="h-3 w-3" />
                Trial: {trialDaysLeft} dias restantes
              </div>
            )}
          </div>
        </div>

        {/* Usage Meter */}
        <UsageMeter />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {stat.description}
                  </p>
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

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5" />
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  user?.subscription_status === 'active' ? 'bg-green-500' :
                  user?.subscription_status === 'trialing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium">
                    Plano {planName}
                    {isOnTrial && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Período de teste
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.monthly_summary_limit ? 
                      `${user.monthly_summary_limit} resumos por mês` : 
                      'Resumos limitados'
                    }
                    {user?.extra_summaries && user.extra_summaries > 0 && (
                      <span className="ml-2 text-green-600">
                        + {user.extra_summaries} extras
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Link href="/dashboard/billing">
                  <Button variant="outline" size="sm">
                    Gerenciar Plano
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Channels Overview */}
        {userChannels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Seus Canais Mais Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userChannels.slice(0, 3).map((channel) => {
                  const channelData = channel.global_youtube_channels
                  const subscriberCount = channelData.subscriber_count
                  const videoCount = channelData.video_count
                  const lastCheck = channelData.last_check_at
                  
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Youtube className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{channelData.channel_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {subscriberCount && (
                              <span>{subscriberCount.toLocaleString('pt-BR')} inscritos</span>
                            )}
                            {videoCount && (
                              <span>{videoCount.toLocaleString('pt-BR')} vídeos</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {lastCheck ? 
                            `Última verificação: ${new Date(lastCheck).toLocaleDateString('pt-BR')}` :
                            'Nunca verificado'
                          }
                        </div>
                      </div>
                    </div>
                  )
                })}
                {userChannels.length > 3 && (
                  <div className="text-center">
                    <Link href="/dashboard/channels">
                      <Button variant="outline" size="sm">
                        Ver todos os {userChannels.length} canais
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Link href="/dashboard/usage">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Relatório de Uso
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
                  const duration = video.video_duration
                  const publishedAt = video.published_at
                  
                  return (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{video.video_title}</h4>
                        {duration && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {duration}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{channel.channel_name}</span>
                        <span>•</span>
                        <span>{new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                        {publishedAt && (
                          <>
                            <span>•</span>
                            <span>Publicado {new Date(publishedAt).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        notification.is_sent 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.is_sent ? 'Enviado' : 'Pendente'}
                      </span>
                      {notification.sent_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(notification.sent_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  )
                })}
                <div className="text-center">
                  <Link href="/dashboard/summaries">
                    <Button variant="outline">
                      Ver Todas as {totalNotifications} Notificações
                    </Button>
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