'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Smartphone, Mail, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  user: User | null
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  // Mock notification preferences - in a real app these would come from the database
  const [preferences, setPreferences] = useState({
    whatsappSummaries: true,
    whatsappChannelAdded: true,
    whatsappPayment: false,
    emailSummaries: false,
    emailChannelAdded: true,
    emailPayment: true,
    emailMarketing: false,
  })

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Preferência atualizada!')
  }

  const handleTestNotification = () => {
    toast.success('Notificação de teste enviada para o WhatsApp!')
  }

  return (
    <div className="space-y-4">
      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5 text-green-500" />
            Notificações WhatsApp
            <Badge variant="default" className="ml-2">Principal</Badge>
          </CardTitle>
          <CardDescription>
            Configure quando receber mensagens no WhatsApp
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Resumos de Vídeos</Label>
              <p className="text-sm text-muted-foreground">
                Receba resumos automáticos quando novos vídeos forem processados
              </p>
            </div>
            <Switch
              checked={preferences.whatsappSummaries}
              onCheckedChange={() => handleToggle('whatsappSummaries')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Canal Adicionado</Label>
              <p className="text-sm text-muted-foreground">
                Confirmação quando um novo canal for adicionado com sucesso
              </p>
            </div>
            <Switch
              checked={preferences.whatsappChannelAdded}
              onCheckedChange={() => handleToggle('whatsappChannelAdded')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Pagamentos</Label>
              <p className="text-sm text-muted-foreground">
                Notificações sobre cobrança, falhas de pagamento e renovações
              </p>
            </div>
            <Switch
              checked={preferences.whatsappPayment}
              onCheckedChange={() => handleToggle('whatsappPayment')}
            />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleTestNotification} variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Enviar Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-blue-500" />
            Notificações por Email
          </CardTitle>
          <CardDescription>
            Configure quando receber emails de notificação
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Resumo Semanal</Label>
              <p className="text-sm text-muted-foreground">
                Receba um resumo semanal de todos os vídeos processados
              </p>
            </div>
            <Switch
              checked={preferences.emailSummaries}
              onCheckedChange={() => handleToggle('emailSummaries')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Canal Adicionado</Label>
              <p className="text-sm text-muted-foreground">
                Confirmação por email quando um canal for adicionado
              </p>
            </div>
            <Switch
              checked={preferences.emailChannelAdded}
              onCheckedChange={() => handleToggle('emailChannelAdded')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Pagamentos e Cobrança</Label>
              <p className="text-sm text-muted-foreground">
                Faturas, confirmações de pagamento e avisos de vencimento
              </p>
            </div>
            <Switch
              checked={preferences.emailPayment}
              onCheckedChange={() => handleToggle('emailPayment')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Novidades e Promoções</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações sobre novos recursos e ofertas especiais
              </p>
            </div>
            <Switch
              checked={preferences.emailMarketing}
              onCheckedChange={() => handleToggle('emailMarketing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Horários de Notificação
          </CardTitle>
          <CardDescription>
            Configure os melhores horários para receber notificações
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de Início</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="06:00">06:00</option>
                <option value="07:00">07:00</option>
                <option value="08:00" selected>08:00</option>
                <option value="09:00">09:00</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Horário de Fim</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
                <option value="22:00" selected>22:00</option>
                <option value="23:00">23:00</option>
              </select>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Notificações do WhatsApp serão enviadas apenas neste horário. 
            Emails importantes (como faturas) podem ser enviados a qualquer momento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}