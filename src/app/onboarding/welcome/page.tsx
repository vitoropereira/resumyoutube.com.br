'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Youtube, Bot, Smartphone } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // UX delay
    router.push('/onboarding/whatsapp')
  }

  const features = [
    {
      icon: Youtube,
      title: 'Monitore Canais do YouTube',
      description: 'Adicione canais ilimitados e monitore novos vídeos automaticamente'
    },
    {
      icon: Bot,
      title: 'Resumos com IA',
      description: 'Receba resumos inteligentes gerados por IA para cada novo vídeo'
    },
    {
      icon: Smartphone,
      title: 'WhatsApp Integrado',
      description: 'Receba seus resumos diretamente no WhatsApp, sem complicação'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Bem-vindo ao Resume YouTube
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Monitore seus canais favoritos e receba resumos inteligentes via WhatsApp
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Trial Grátis de 7 dias</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Teste todas as funcionalidades sem compromisso. Cancele a qualquer momento.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              {isLoading ? (
                'Carregando...'
              ) : (
                <>
                  Começar Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-500">
              Processo de configuração em 5 etapas simples
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}