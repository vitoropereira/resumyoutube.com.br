import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Youtube, 
  FileText, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  BarChart3
} from 'lucide-react'

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

  // Get user channels
  const { data: channels } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('user_id', user.id)

  // Get recent summaries
  const { data: summaries } = await supabase
    .from('processed_videos')
    .select(`
      *,
      youtube_channels(channel_name)
    `)
    .eq('youtube_channels.user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return {
    user: profile,
    channels: channels || [],
    summaries: summaries || [],
    subscription
  }
}

export default async function DashboardPage() {
  const { user, channels, summaries, subscription } = await getUserData()

  const stats = [
    {
      title: 'Canais Ativos',
      value: channels.filter(c => c.is_active).length,
      description: `de ${user?.max_channels || 3} permitidos`,
      icon: Youtube,
      color: 'text-red-500',
    },
    {
      title: 'Resumos Este Mês',
      value: summaries.length,
      description: 'de 30 permitidos',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Status Assinatura',
      value: subscription?.status === 'active' ? 'Ativa' : 'Inativa',
      description: subscription?.status === 'active' 
        ? 'Renovação automática' 
        : 'Faça upgrade para continuar',
      icon: CheckCircle,
      color: subscription?.status === 'active' ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Último Resumo',
      value: summaries.length > 0 ? 'Hoje' : 'Nenhum',
      description: summaries.length > 0 
        ? `${summaries[0]?.youtube_channels?.channel_name}` 
        : 'Adicione canais para começar',
      icon: Clock,
      color: 'text-purple-500',
    },
  ]

  return (
    <DashboardLayout title="Dashboard" user={user}>
      <div className="space-y-6">
        {/* Stats Grid */}
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Youtube className="mr-2 h-5 w-5 text-red-500" />
                Meus Canais
              </CardTitle>
              <CardDescription>
                Canais que você está monitorando
              </CardDescription>
            </CardHeader>
            <CardContent>
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum canal adicionado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {channels.slice(0, 3).map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Youtube className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{channel.channel_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {channel.subscriber_count?.toLocaleString()} inscritos
                          </p>
                        </div>
                      </div>
                      <Badge variant={channel.is_active ? "default" : "secondary"}>
                        {channel.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  {channels.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{channels.length - 3} mais canais
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Summaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Resumos Recentes
              </CardTitle>
              <CardDescription>
                Últimos vídeos resumidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum resumo ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {summaries.slice(0, 3).map((summary) => (
                    <div key={summary.id} className="space-y-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {summary.video_title}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{summary.youtube_channels?.channel_name}</span>
                        <Badge variant={summary.sent_to_user ? "default" : "secondary"}>
                          {summary.sent_to_user ? 'Enviado' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {summaries.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{summaries.length - 3} mais resumos
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Tarefas comuns para gerenciar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Youtube className="mr-3 h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium">Adicionar Canal</p>
                  <p className="text-sm text-muted-foreground">
                    Monitore um novo canal
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <BarChart3 className="mr-3 h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Ver Resumos</p>
                  <p className="text-sm text-muted-foreground">
                    Histórico completo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="mr-3 h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">Gerenciar Assinatura</p>
                  <p className="text-sm text-muted-foreground">
                    Planos e pagamentos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}