'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, Shield, AlertCircle } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/types'

export default function PaymentPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('pro') // Default to Pro plan
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Carregar plano salvo do localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('onboarding_selected_plan')
    if (savedPlan) {
      setSelectedPlan(savedPlan)
    }
  }, [])

  const handlePlanSelect = (planKey: string) => {
    setSelectedPlan(planKey)
    // Salvar plano selecionado no localStorage
    localStorage.setItem('onboarding_selected_plan', planKey)
  }

  const handleSubscribe = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Obter dados salvos do onboarding
      const phone = localStorage.getItem('onboarding_phone')
      const profileData = localStorage.getItem('onboarding_profile')

      if (!phone || !profileData) {
        setError('Dados do onboarding não encontrados. Reinicie o processo.')
        setIsLoading(false)
        return
      }

      const profile = JSON.parse(profileData)

      // Criar checkout no Stripe
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscription',
          plan: selectedPlan,
          trial_days: 7,
          onboarding_data: {
            phone_number: phone,
            business_type: profile.business_type,
            content_interest: profile.content_interest,
            summary_frequency: profile.summary_frequency
          },
          success_url: `${window.location.origin}/onboarding/complete`,
          cancel_url: `${window.location.origin}/onboarding/payment`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.checkout_url
    } catch (error) {
      console.error('Erro no checkout:', error)
      setError(error instanceof Error ? error.message : 'Erro interno. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/onboarding/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Escolha seu Plano
          </CardTitle>
          <CardDescription>
            Todos os planos incluem 7 dias grátis para testar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Aviso do Trial */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Trial Grátis de 7 dias</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Você não será cobrado agora. Teste todas as funcionalidades por 7 dias gratuitamente. 
              Cancele a qualquer momento sem custo.
            </p>
          </div>

          {/* Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <Card 
                key={key}
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === key 
                    ? 'ring-2 ring-orange-600 bg-orange-50' 
                    : 'hover:shadow-lg'
                } ${plan.popular ? 'border-orange-600' : ''}`}
                onClick={() => handlePlanSelect(key)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-600">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-orange-600">
                    {plan.price_display}
                    <span className="text-base font-normal text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {plan.monthly_summary_limit === 9999 ? 'Ilimitado' : `${plan.monthly_summary_limit} resumos`}/mês
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {selectedPlan === key && (
                    <div className="mt-4 p-2 bg-orange-100 rounded text-center">
                      <span className="text-sm font-medium text-orange-800">Selecionado</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Informações de Segurança */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Pagamento Seguro</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Processado pelo Stripe, o mesmo sistema usado por Spotify, Uber e milhares de empresas. 
                  Seus dados estão protegidos e não armazenamos informações do cartão.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Confirmação */}
          <div className="space-y-4">
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
            >
              {isLoading ? (
                'Preparando checkout...'
              ) : (
                <>
                  Iniciar Trial Grátis - {SUBSCRIPTION_PLANS[selectedPlan]?.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-500">
              Você será redirecionado para a página segura de pagamento do Stripe
            </p>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button"
              variant="ghost" 
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="text-sm text-gray-500">
              Etapa 4 de 5
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}