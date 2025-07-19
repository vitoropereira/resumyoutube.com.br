'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, User, Briefcase, Heart, Clock, AlertCircle } from 'lucide-react'
import { BusinessType, ContentInterest, SummaryFrequency, BUSINESS_TYPES, CONTENT_INTERESTS, SUMMARY_FREQUENCIES } from '@/lib/types'
import { useOnboarding } from '@/hooks/use-onboarding'

const businessTypeLabels: Record<BusinessType, { label: string; description: string; icon: React.ElementType }> = {
  creator: {
    label: 'Criador de Conteúdo',
    description: 'YouTuber, influencer, produtor de conteúdo',
    icon: User
  },
  business: {
    label: 'Empresa/Negócio',
    description: 'Monitorar concorrência, tendências do mercado',
    icon: Briefcase
  },
  personal: {
    label: 'Uso Pessoal',
    description: 'Acompanhar canais favoritos, hobbies',
    icon: Heart
  },
  agency: {
    label: 'Agência/Consultoria',
    description: 'Gerenciar múltiplos clientes e projetos',
    icon: Briefcase
  }
}

const contentInterestLabels: Record<ContentInterest, string> = {
  tech: 'Tecnologia',
  business: 'Negócios',
  entertainment: 'Entretenimento',
  education: 'Educação',
  lifestyle: 'Lifestyle',
  news: 'Notícias',
  other: 'Outros'
}

const summaryFrequencyLabels: Record<SummaryFrequency, { label: string; description: string }> = {
  realtime: {
    label: 'Tempo Real',
    description: 'Assim que novos vídeos são publicados'
  },
  daily: {
    label: 'Diário',
    description: 'Um resumo por dia com todos os vídeos'
  },
  weekly: {
    label: 'Semanal',
    description: 'Resumo semanal consolidado'
  },
  monthly: {
    label: 'Mensal',
    description: 'Resumo mensal dos destaques'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { saveData } = useOnboarding()
  const [businessType, setBusinessType] = useState<BusinessType>()
  const [contentInterest, setContentInterest] = useState<ContentInterest>()
  const [summaryFrequency, setSummaryFrequency] = useState<SummaryFrequency>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('onboarding_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setBusinessType(profile.business_type)
        setContentInterest(profile.content_interest)
        setSummaryFrequency(profile.summary_frequency)
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error)
      }
    }
  }, [])

  // Auto-salvar dados quando alterados
  useEffect(() => {
    if (businessType || contentInterest || summaryFrequency) {
      const profileData = {
        business_type: businessType,
        content_interest: contentInterest,
        summary_frequency: summaryFrequency
      }
      localStorage.setItem('onboarding_profile', JSON.stringify(profileData))
    }
  }, [businessType, contentInterest, summaryFrequency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Preparar dados para salvar (todos são opcionais)
      const profileData = {
        business_type: businessType,
        content_interest: contentInterest,
        summary_frequency: summaryFrequency
      }
      
      // Salvar no localStorage como backup
      localStorage.setItem('onboarding_profile', JSON.stringify(profileData))
      
      // Tentar salvar no banco de dados
      try {
        setSaveStatus('saving')
        console.log('Tentando salvar dados no banco:', profileData)
        const success = await saveData(profileData)
        if (success) {
          console.log('✅ Dados salvos no banco com sucesso')
          setSaveStatus('saved')
        } else {
          console.log('❌ Erro ao salvar no banco, continuando com localStorage')
          setSaveStatus('error')
        }
      } catch (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError)
        setSaveStatus('error')
        // Continua mesmo se falhar o salvamento no banco
      }
      
      // Pequeno delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/onboarding/payment')
    } catch (error) {
      console.error('Erro no handleSubmit:', error)
      setError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/onboarding/whatsapp')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Conte-nos sobre você
          </CardTitle>
          <CardDescription>
            Essas informações nos ajudam a personalizar sua experiência
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pergunta 1: Tipo de Negócio */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                1. Como você pretende usar o Resume YouTube?
              </Label>
              <RadioGroup value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUSINESS_TYPES.map((type) => {
                    const config = businessTypeLabels[type]
                    const Icon = config.icon
                    const isSelected = businessType === type
                    const uniqueId = `business-${type}`
                    return (
                      <div key={type} className="relative">
                        <RadioGroupItem value={type} id={uniqueId} className="sr-only" />
                        <Label
                          htmlFor={uniqueId}
                          className={`flex flex-col items-start space-y-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">{config.label}</span>
                          </div>
                          <span className="text-sm text-gray-600">{config.description}</span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Pergunta 2: Interesse de Conteúdo */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                2. Qual seu principal interesse de conteúdo?
              </Label>
              <RadioGroup value={contentInterest} onValueChange={(value) => setContentInterest(value as ContentInterest)}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CONTENT_INTERESTS.map((interest) => {
                    const isSelected = contentInterest === interest
                    const uniqueId = `content-${interest}`
                    return (
                      <div key={interest} className="relative">
                        <RadioGroupItem value={interest} id={uniqueId} className="sr-only" />
                        <Label
                          htmlFor={uniqueId}
                          className={`flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all text-center ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {contentInterestLabels[interest]}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Pergunta 3: Frequência de Resumos */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                3. Com que frequência quer receber resumos?
              </Label>
              <RadioGroup value={summaryFrequency} onValueChange={(value) => setSummaryFrequency(value as SummaryFrequency)}>
                <div className="space-y-3">
                  {SUMMARY_FREQUENCIES.map((frequency) => {
                    const config = summaryFrequencyLabels[frequency]
                    const isSelected = summaryFrequency === frequency
                    const uniqueId = `frequency-${frequency}`
                    return (
                      <div key={frequency} className="relative">
                        <RadioGroupItem value={frequency} id={uniqueId} className="sr-only" />
                        <Label
                          htmlFor={uniqueId}
                          className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{config.label}</div>
                            <div className="text-sm text-gray-600">{config.description}</div>
                          </div>
                          <Clock className="w-5 h-5 text-purple-600" />
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>💡 Dica:</strong> Suas preferências podem ser alteradas a qualquer momento nas configurações da sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
              >
                {isLoading ? (
                  'Salvando...'
                ) : (
                  <>
                    {(businessType || contentInterest || summaryFrequency) ? 'Salvar e Continuar' : 'Pular Perguntas'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              {(businessType || contentInterest || summaryFrequency) && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/payment')}
                  className="w-full h-10"
                >
                  Pular e Continuar
                </Button>
              )}
            </div>
          </form>

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
              Etapa 3 de 5
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}