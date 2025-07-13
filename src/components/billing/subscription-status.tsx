'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Subscription } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CreditCard, Calendar, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/stripe'

interface SubscriptionStatusProps {
  subscription: Subscription | null
  user: User | null
  currentMonthUsage: number
}

export function SubscriptionStatus({ subscription, user, currentMonthUsage }: SubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isActive = subscription?.status === 'active'
  const usagePercentage = (currentMonthUsage / 30) * 100

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Erro ao processar upgrade. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao acessar portal de cobrança')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Erro ao acessar portal de cobrança. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (!isActive) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <CardTitle className="text-yellow-800">Assinatura Inativa</CardTitle>
                <CardDescription className="text-yellow-600">
                  Faça upgrade para continuar monitorando seus canais
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">Inativo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">Limitações atuais:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Sem monitoramento de canais</li>
                <li>• Sem novos resumos</li>
                <li>• Sem notificações WhatsApp</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">Com a assinatura:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Até 3 canais monitorados</li>
                <li>• 30 resumos por mês</li>
                <li>• Resumos automáticos</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? 'Processando...' : 'Fazer Upgrade - R$ 39,90/mês'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <CardTitle>Assinatura Ativa</CardTitle>
              <CardDescription>
                Sua assinatura está ativa e funcionando normalmente
              </CardDescription>
            </div>
          </div>
          <Badge variant="default">Ativo</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Plano</p>
            <p className="text-lg font-semibold">Resume YouTube Pro</p>
            <p className="text-sm text-gray-600">{formatPrice(subscription.amount_cents || 3990)}/mês</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Próxima cobrança</p>
            <p className="text-lg font-semibold">
              {subscription.current_period_end 
                ? formatDate(subscription.current_period_end)
                : 'N/A'
              }
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Método de pagamento</p>
            <p className="text-lg font-semibold">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-600">Visa</p>
          </div>
        </div>

        {/* Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Uso este mês</h3>
            <span className="text-sm text-gray-500">
              {currentMonthUsage} / 30 resumos
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          {usagePercentage > 80 && (
            <p className="text-xs text-yellow-600">
              Você está próximo do limite mensal de resumos.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleManageBilling}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar Cobrança
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Cancelar Assinatura
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até{' '}
                  {subscription.current_period_end && formatDate(subscription.current_period_end)}.
                  Após essa data, não receberá mais resumos automáticos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleManageBilling}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}