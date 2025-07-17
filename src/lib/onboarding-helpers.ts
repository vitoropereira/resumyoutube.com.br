import { User } from '@/lib/types'

/**
 * Verifica se o usuário completou o onboarding
 */
export function hasCompletedOnboarding(user: User): boolean {
  return !!(
    user.whatsapp_validated &&
    user.business_type &&
    user.content_interest &&
    user.summary_frequency
  )
}

/**
 * Determina qual etapa do onboarding o usuário deve ir
 */
export function getOnboardingStep(user: User): string {
  // Se não tem WhatsApp validado, começar do início
  if (!user.whatsapp_validated) {
    return '/onboarding/welcome'
  }
  
  // Se não tem perfil completo, ir para profile
  if (!user.business_type || !user.content_interest || !user.summary_frequency) {
    return '/onboarding/profile'
  }
  
  // Se não tem subscription ativa, ir para payment
  if (!user.subscription_status || user.subscription_status === 'incomplete') {
    return '/onboarding/payment'
  }
  
  // Onboarding completo
  return '/dashboard'
}

/**
 * Verifica se a rota atual é uma rota de onboarding
 */
export function isOnboardingRoute(pathname: string): boolean {
  return pathname.startsWith('/onboarding/')
}

/**
 * Verifica se a rota atual é uma rota de auth
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/')
}

/**
 * Rotas que não precisam de verificação de onboarding
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/auth-code-error',
    '/api'
  ]
  
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/')
  )
}