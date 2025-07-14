import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Erro na Autenticação</CardTitle>
          <CardDescription>
            Ocorreu um problema durante o login social
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Não foi possível completar o login com sua conta social.
            </p>
            <p className="text-sm text-gray-500">
              Tente fazer login novamente ou use email e senha.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">
                Tentar Novamente
              </Button>
            </Link>
            
            <Link href="/auth/register" className="w-full">
              <Button variant="outline" className="w-full">
                Criar Conta com Email
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}