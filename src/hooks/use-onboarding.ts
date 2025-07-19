import { useState, useEffect } from 'react'
import { BusinessType, ContentInterest, SummaryFrequency } from '@/lib/types'

interface OnboardingData {
  phone_number?: string
  whatsapp_validated?: boolean
  business_type?: BusinessType
  content_interest?: ContentInterest
  summary_frequency?: SummaryFrequency
}

interface UseOnboardingReturn {
  saveData: (data: Partial<OnboardingData>) => Promise<boolean>
  loadData: () => Promise<OnboardingData | null>
  isLoading: boolean
  error: string | null
}

export function useOnboarding(): UseOnboardingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveData = async (data: Partial<OnboardingData>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar dados')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao salvar dados do onboarding:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async (): Promise<OnboardingData | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/get')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar dados')
      }

      return result.profile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar dados do onboarding:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    saveData,
    loadData,
    isLoading,
    error
  }
}

// Hook para auto-salvar dados do localStorage e limpar após sucesso
export function useAutoSaveFromLocalStorage() {
  const { saveData } = useOnboarding()

  const autoSave = async () => {
    try {
      // Buscar dados do localStorage
      const phone = localStorage.getItem('onboarding_phone')
      const profileData = localStorage.getItem('onboarding_profile')

      if (!phone && !profileData) {
        return false
      }

      const dataToSave: Partial<OnboardingData> = {}

      // Adicionar telefone se existir
      if (phone) {
        dataToSave.phone_number = phone
        dataToSave.whatsapp_validated = true
      }

      // Adicionar dados do perfil se existirem
      if (profileData) {
        try {
          const profile = JSON.parse(profileData)
          dataToSave.business_type = profile.business_type
          dataToSave.content_interest = profile.content_interest
          dataToSave.summary_frequency = profile.summary_frequency
        } catch (error) {
          console.error('Erro ao parsear dados do perfil do localStorage:', error)
        }
      }

      // Salvar no banco
      const success = await saveData(dataToSave)

      // Limpar localStorage se salvou com sucesso
      if (success) {
        localStorage.removeItem('onboarding_phone')
        localStorage.removeItem('onboarding_profile')
      }

      return success
    } catch (error) {
      console.error('Erro no auto-save:', error)
      return false
    }
  }

  return { autoSave }
}

// Hook para salvamento automático incremental
export function useIncrementalSave() {
  const { saveData } = useOnboarding()
  
  const saveStep = async (stepData: Partial<OnboardingData>) => {
    try {
      const success = await saveData(stepData)
      return success
    } catch (error) {
      console.error('Erro ao salvar etapa:', error)
      return false
    }
  }

  return { saveStep }
}