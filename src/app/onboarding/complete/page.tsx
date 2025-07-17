'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Youtube, Smartphone, Zap, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function CompletePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Confetti animation on page load
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 500)

    // Cleanup localStorage do onboarding
    localStorage.removeItem('onboarding_phone')
    localStorage.removeItem('onboarding_profile')

    return () => clearTimeout(timer)
  }, [])

  const handleGoToDashboard = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/dashboard')
  }

  const nextSteps = [
    {
      icon: Youtube,
      title: 'Adicione seus canais',
      description: 'Adicione os canais do YouTube que você quer monitorar',
      action: 'Gerenciar Canais'
    },
    {
      icon: Smartphone,
      title: 'Configure notificações',
      description: 'Personalize como e quando receber resumos no WhatsApp',
      action: 'Configurações'
    },
    {
      icon: Zap,
      title: 'Veja resumos em ação',
      description: 'Aguarde novos vídeos ou teste com vídeos existentes',
      action: 'Ver Resumos'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto">
            <div className="relative">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Parabéns! 🎉
            </CardTitle>
            <CardTitle className="text-2xl font-bold text-green-600">
              Sua conta foi criada com sucesso!
            </CardTitle>
          </div>
          
          <CardDescription className="text-lg text-gray-600">
            Agora você tem acesso completo ao Resume YouTube por 7 dias grátis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Status do Trial */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-xl font-semibold text-green-800">Trial Ativo</span>
              </div>
              <p className="text-green-700">
                Você tem <strong>7 dias grátis</strong> para explorar todas as funcionalidades
              </p>
              <p className="text-sm text-green-600">
                Sem compromisso • Cancele a qualquer momento
              </p>
            </div>
          </div>

          {/* O que você pode fazer agora */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-900">
              O que você pode fazer agora:
            </h3>
            
            <div className="grid gap-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600">{step.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo da Configuração */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">✅ Configuração Completa:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• WhatsApp validado</div>
              <div>• Perfil configurado</div>
              <div>• Plano ativo</div>
              <div>• Trial de 7 dias iniciado</div>
            </div>
          </div>

          {/* Botão para Dashboard */}
          <div className="space-y-4">
            <Button 
              onClick={handleGoToDashboard}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg"
            >
              {isLoading ? (
                'Carregando dashboard...'
              ) : (
                <>
                  Ir para o Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-500">
              Vamos começar a monitorar seus canais favoritos!
            </p>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500">
              ✨ Etapa 5 de 5 - Concluído!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}