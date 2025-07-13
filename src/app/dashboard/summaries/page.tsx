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

  // Get all summaries with channel info
  const { data: summaries } = await supabase
    .from('processed_videos')
    .select(`
      *,
      youtube_channels(
        id,
        channel_name,
        user_id
      )
    `)
    .eq('youtube_channels.user_id', user.id)
    .order('created_at', { ascending: false })

  return {
    user: profile,
    summaries: summaries || []
  }
}

export default async function SummariesPage() {
  const { user, summaries } = await getUserData()

  // Calculate stats
  const totalSummaries = summaries.length
  const sentSummaries = summaries.filter(s => s.sent_to_user).length
  const pendingSummaries = summaries.filter(s => !s.sent_to_user).length
  const thisMonthSummaries = summaries.filter(s => {
    const created = new Date(s.created_at!)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    {
      title: 'Total de Resumos',
      value: totalSummaries,
      description: 'Todos os vídeos processados',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Este Mês',
      value: thisMonthSummaries,
      description: 'de 30 permitidos',
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: 'Enviados',
      value: sentSummaries,
      description: 'Resumos entregues',
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    {
      title: 'Pendentes',
      value: pendingSummaries,
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
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Resumos</h2>
          <p className="text-gray-600">
            Visualize e gerencie todos os resumos de vídeos processados
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
        {summaries.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle>Nenhum resumo encontrado</CardTitle>
              <CardDescription>
                Adicione canais no YouTube e aguarde novos vídeos serem processados
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            <SummaryFilters />
            <SummaryList summaries={summaries} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}