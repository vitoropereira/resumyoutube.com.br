import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Youtube, Smartphone, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Youtube className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold text-blue-600">Resume YouTube</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Resumos Inteligentes do <span className="text-red-500">YouTube</span> no <span className="text-green-500">WhatsApp</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Monitore seus canais favoritos e receba resumos automáticos dos novos vídeos diretamente no WhatsApp. 
          Nunca mais perca conteúdo importante!
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/auth/register">Começar Agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Youtube className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Adicione Canais</CardTitle>
              <CardDescription>
                Conecte até 3 canais do YouTube que você deseja monitorar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>IA Analisa</CardTitle>
              <CardDescription>
                Nossa IA cria resumos inteligentes dos novos vídeos automaticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Receba no WhatsApp</CardTitle>
              <CardDescription>
                Resumos chegam direto no seu WhatsApp, quando você quiser
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Plano Mensal</CardTitle>
              <div className="text-4xl font-bold text-blue-600">R$ 39,90</div>
              <CardDescription>Tudo que você precisa para começar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span>Até 3 canais monitorados</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span>Até 30 resumos por mês</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span>Resumos via WhatsApp</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span>Dashboard completo</span>
                </div>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/auth/register">Começar Agora</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Resume YouTube. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
