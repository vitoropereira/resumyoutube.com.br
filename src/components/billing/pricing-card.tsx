'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/stripe'

interface PricingCardProps {
  user: User | null
}

export function PricingCard({ user }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)

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
      console.error('Checkout error:', error)
      toast.error('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    'Até 3 canais monitorados',
    'Até 30 resumos por mês',
    'Resumos automáticos via WhatsApp',
    'Dashboard completo',
    'Histórico de todos os resumos',
    'Ativar/desativar canais',
    'Filtros avançados',
    'Suporte por email'
  ]

  return (
    <Card className="relative border-2 border-blue-200 bg-blue-50/50">
      {/* Popular Badge */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <Badge className="bg-blue-600 hover:bg-blue-700">
          Mais Popular
        </Badge>
      </div>

      <CardHeader className="text-center pt-8">
        <CardTitle className="text-2xl">Resume YouTube Pro</CardTitle>
        <CardDescription>
          Tudo que você precisa para monitorar seus canais favoritos
        </CardDescription>
        
        <div className="space-y-2">
          <div className="text-4xl font-bold text-blue-600">
            {formatPrice(3990)}
          </div>
          <p className="text-sm text-gray-600">por mês</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Assinar Agora
            </>
          )}
        </Button>

        {/* Security */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Pagamento seguro via Stripe • Cancele a qualquer momento
          </p>
        </div>

        {/* Guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 text-center">
            <strong>Garantia de 7 dias</strong><br />
            Não ficou satisfeito? Devolvemos seu dinheiro
          </p>
        </div>
      </CardContent>
    </Card>
  )
}