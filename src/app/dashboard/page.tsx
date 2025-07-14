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

  // Get channels count
  const { count: channelsCount } = await supabase
    .from('youtube_channels')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get summaries count (assuming summaries table exists)
  const { count: summariesCount } = await supabase
    .from('summaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .then(result => result)
    .catch(() => ({ count: 0 }))

  // Get recent summaries (mock for now since summaries table may not exist)
  const recentSummaries: any[] = []

  return {
    user: profile,
    channelsCount: channelsCount || 0,
    summariesCount: summariesCount?.count || 0,
    recentSummaries: recentSummaries || []
  }
}

export default async function DashboardPage() {
  const { user, channelsCount, summariesCount, recentSummaries } = await getUserData()

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

        {/* Recent Summaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Resumos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSummaries.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum resumo ainda
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Adicione um canal para começar a receber resumos automáticos
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
                {recentSummaries.map((summary) => (
                  <div key={summary.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{summary.title}</h4>
                      <p className="text-sm text-gray-500">
                        {summary.channels?.name} • {new Date(summary.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      summary.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : summary.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {summary.status === 'completed' ? 'Concluído' : 
                       summary.status === 'processing' ? 'Processando' : 'Erro'}
                    </span>
                  </div>
                ))}
                <div className="text-center">
                  <Link href="/dashboard/summaries">
                    <Button variant="outline">Ver Todos os Resumos</Button>
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