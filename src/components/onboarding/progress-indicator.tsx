'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  isAutoSaving?: boolean
  lastSaved?: Date | null
  className?: string
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  isAutoSaving = false, 
  lastSaved, 
  className = '' 
}: ProgressIndicatorProps) {
  const [showSaveStatus, setShowSaveStatus] = useState(false)

  useEffect(() => {
    if (isAutoSaving || lastSaved) {
      setShowSaveStatus(true)
      const timer = setTimeout(() => setShowSaveStatus(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isAutoSaving, lastSaved])

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins === 1) return 'Há 1 minuto'
    if (diffMins < 60) return `Há ${diffMins} minutos`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return 'Há 1 hora'
    return `Há ${diffHours} horas`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1
            const status = getStepStatus(stepNumber)
            
            return (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    status === 'completed'
                      ? 'bg-green-600 text-white'
                      : status === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {i < totalSteps - 1 && (
                  <div
                    className={`w-8 h-1 mx-2 ${
                      status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
        
        <div className="text-sm text-gray-500">
          {currentStep} de {totalSteps}
        </div>
      </div>

      {/* Auto-save Status */}
      {showSaveStatus && (
        <div className="flex items-center space-x-2 text-sm">
          {isAutoSaving ? (
            <>
              <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-blue-600">Salvando automaticamente...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-600">
                Salvo automaticamente {formatLastSaved(lastSaved)}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-600">Erro ao salvar</span>
            </>
          )}
        </div>
      )}

      {/* Step Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Boas-vindas</span>
        <span>WhatsApp</span>
        <span>Perfil</span>
        <span>Pagamento</span>
        <span>Concluído</span>
      </div>
    </div>
  )
}