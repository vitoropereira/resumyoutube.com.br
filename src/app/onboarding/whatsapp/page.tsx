'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Smartphone, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useOnboardingProgress } from '@/hooks/use-onboarding-progress'
import { ProgressIndicator } from '@/components/onboarding/progress-indicator'

export default function WhatsAppPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { saveData } = useOnboarding()
  const progress = useOnboardingProgress()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<'phone' | 'verification'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('onboarding_phone')
    if (savedPhone) {
      setPhoneNumber(savedPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'))
    }
  }, [])

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const cleanPhone = phoneNumber.replace(/\D/g, '')
    
    if (cleanPhone.length !== 11) {
      setError('Digite um número válido com DDD (11 dígitos)')
      setIsLoading(false)
      return
    }

    try {
      // Salvar no localStorage temporariamente
      localStorage.setItem('onboarding_phone', cleanPhone)
      
      // TODO: Implementar API de validação WhatsApp
      // Por enquanto, simulamos o envio do código
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Código enviado!',
        description: 'Verifique seu WhatsApp e digite o código de 6 dígitos.',
      })
      
      setStep('verification')
    } catch (error) {
      setError('Erro ao enviar código. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (verificationCode.length !== 6) {
      setError('Digite o código de 6 dígitos')
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implementar verificação real do código
      // Por enquanto, simulamos a verificação
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      
      // Salvar no banco de dados usando o novo sistema de progresso
      const success = await progress.saveStep({
        phone_number: cleanPhone,
        whatsapp_validated: true
      })
      
      if (!success) {
        setError('Erro ao salvar dados. Tente novamente.')
        return
      }
      
      // Limpar localStorage já que foi salvo no banco
      localStorage.removeItem('onboarding_phone')
      
      toast({
        title: 'WhatsApp validado!',
        description: 'Seu número foi verificado com sucesso.',
      })
      
      router.push('/onboarding/profile')
    } catch (error) {
      setError('Código inválido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'verification') {
      setStep('phone')
      setVerificationCode('')
      setError('')
    } else {
      router.push('/onboarding/welcome')
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast({
      title: 'Código reenviado',
      description: 'Um novo código foi enviado para seu WhatsApp.',
    })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Validar WhatsApp
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Digite seu número do WhatsApp para receber os resumos'
              : 'Digite o código de 6 dígitos enviado para seu WhatsApp'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <ProgressIndicator 
            currentStep={progress.currentStep}
            totalSteps={5}
            isAutoSaving={progress.isAutoSaving}
            lastSaved={progress.lastSaved}
          />

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone">Número do WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="mt-1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Digite com DDD (exemplo: 11999999999)
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Por que validar?</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Você receberá seus resumos diretamente no WhatsApp de forma automática e segura.
                </p>
              </div>

              <Button 
                type="submit"
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length !== 11}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Enviando código...' : 'Enviar código de verificação'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código de verificação</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 text-center text-2xl tracking-wider"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código enviado para {phoneNumber}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-sm text-green-600 hover:text-green-700 underline"
                  disabled={isLoading}
                >
                  Reenviar código
                </button>
              </div>

              <Button 
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </Button>
            </form>
          )}

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
              Etapa 2 de 5
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}