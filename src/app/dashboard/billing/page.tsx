import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { SubscriptionStatus } from '@/components/billing/subscription-status'
import { PricingCard } from '@/components/billing/pricing-card'
import { BillingHistory } from '@/components/billing/billing-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

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

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get usage stats from user notifications
  const { data: notifications } = await supabase
    .from('user_video_notifications')
    .select('id, created_at')
    .eq('user_id', user.id)

  // Calculate current month usage
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthUsage = notifications?.filter(n => 
    new Date(n.created_at!) >= startOfMonth
  ).length || 0

  return {
    user: profile,
    subscription,
    currentMonthUsage
  }
}

export default async function BillingPage() {
  const { user, subscription, currentMonthUsage } = await getUserData()

  const isActive = subscription?.status === 'active'
  const nextBilling = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
    : null

  const stats = [
    {
      title: 'Status da Assinatura',
      value: isActive ? 'Ativa' : 'Inativa',
      description: isActive ? 'Renovação automática' : 'Faça upgrade para continuar',
      icon: isActive ? CheckCircle : AlertCircle,
      color: isActive ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Próxima Cobrança',
      value: nextBilling || 'N/A',
      description: isActive ? 'Data da próxima renovação' : 'Nenhuma cobrança agendada',
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      title: 'Uso Este Mês',
      value: currentMonthUsage,
description: 'de 30 notificações permitidas',
      icon: CreditCard,
      color: currentMonthUsage > 25 ? 'text-yellow-500' : 'text-green-500',
    },
  ]

  return (
    <DashboardLayout title="Assinatura" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Assinatura</h2>
          <p className="text-gray-600">
            Visualize e gerencie sua assinatura, planos e histórico de pagamentos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        {/* Subscription Status */}
        <SubscriptionStatus 
          subscription={subscription} 
          user={user}
          currentMonthUsage={currentMonthUsage}
        />

        {/* Pricing Card (if not subscribed) */}
        {!isActive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PricingCard user={user} />
            
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>O que está incluído</CardTitle>
                <CardDescription>
                  Todos os recursos para monitorar seus canais favoritos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Até 3 canais monitorados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Até 30 notificações por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Notificações automáticas via WhatsApp</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Dashboard completo</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Histórico de todas as notificações</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Suporte por email</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing History */}
        {isActive && (
          <BillingHistory subscription={subscription} />
        )}

        {/* Usage Warning */}
        {currentMonthUsage > 25 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <CardTitle className="text-yellow-800">Aviso de Uso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                Você já utilizou {currentMonthUsage} de 30 notificações este mês. 
                {currentMonthUsage >= 30 
                  ? ' Você atingiu o limite mensal.'
                  : ` Restam ${30 - currentMonthUsage} notificações.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}