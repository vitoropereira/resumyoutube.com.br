'use client'

import { useState, useEffect } from 'react'
import { useIncrementalSave } from './use-onboarding'
import { BusinessType, ContentInterest, SummaryFrequency } from '@/lib/types'

interface OnboardingProgress {
  currentStep: number
  isAutoSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  saveStep: (stepData: any) => Promise<boolean>
  markStepComplete: (step: number) => void
  getStepStatus: (step: number) => 'completed' | 'active' | 'pending'
}

export function useOnboardingProgress(): OnboardingProgress {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  
  const { saveStep: saveStepData } = useIncrementalSave()

  // Determinar etapa atual baseado na URL
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('/onboarding/welcome')) setCurrentStep(1)
    else if (path.includes('/onboarding/whatsapp')) setCurrentStep(2)
    else if (path.includes('/onboarding/profile')) setCurrentStep(3)
    else if (path.includes('/onboarding/payment')) setCurrentStep(4)
    else if (path.includes('/onboarding/complete')) setCurrentStep(5)
  }, [])

  // Carregar progresso do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setCompletedSteps(new Set(progress.completedSteps || []))
        setLastSaved(progress.lastSaved ? new Date(progress.lastSaved) : null)
      } catch (error) {
        console.error('Erro ao carregar progresso do onboarding:', error)
      }
    }
  }, [])

  // Salvar progresso no localStorage
  const saveProgress = () => {
    const progress = {
      completedSteps: Array.from(completedSteps),
      lastSaved: lastSaved?.toISOString(),
      currentStep
    }
    localStorage.setItem('onboarding_progress', JSON.stringify(progress))
  }

  useEffect(() => {
    saveProgress()
  }, [completedSteps, lastSaved, currentStep])

  const saveStep = async (stepData: any) => {
    setIsAutoSaving(true)
    setHasUnsavedChanges(false)
    
    try {
      const success = await saveStepData(stepData)
      
      if (success) {
        setLastSaved(new Date())
        setCompletedSteps(prev => new Set([...prev, currentStep]))
      }
      
      return success
    } catch (error) {
      console.error('Erro ao salvar etapa:', error)
      return false
    } finally {
      setIsAutoSaving(false)
    }
  }

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]))
  }

  const getStepStatus = (step: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.has(step)) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  return {
    currentStep,
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    saveStep,
    markStepComplete,
    getStepStatus
  }
}