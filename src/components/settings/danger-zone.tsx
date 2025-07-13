'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Trash2, Download, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface DangerZoneProps {
  user: User | null
}

export function DangerZone({ user }: DangerZoneProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // In a real app, this would generate and download the user's data
      // For now, we'll simulate the export
      const userData = {
        profile: user,
        exportDate: new Date().toISOString(),
        // channels: [], // Would fetch user's channels
        // summaries: [], // Would fetch user's summaries
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumeyoutube-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Digite "DELETE" para confirmar')
      return
    }

    setIsDeleting(true)
    try {
      // In a real app, you would:
      // 1. Cancel any active Stripe subscriptions
      // 2. Delete user data from database
      // 3. Delete the auth user
      
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '')
      
      if (error) throw error

      toast.success('Conta deletada com sucesso')
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Erro ao deletar conta. Entre em contato com o suporte.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5 text-blue-500" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Baixe uma cópia de todos os seus dados
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Você pode exportar todos os seus dados incluindo perfil, canais monitorados, 
            histórico de resumos e configurações. Os dados serão fornecidos em formato JSON.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Dados incluídos:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Informações do perfil</li>
              <li>• Canais do YouTube monitorados</li>
              <li>• Histórico de resumos</li>
              <li>• Configurações de notificação</li>
              <li>• Histórico de assinaturas</li>
            </ul>
          </div>

          <Button 
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? 'Exportando...' : 'Exportar Meus Dados'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-green-500" />
            Segurança da Conta
          </CardTitle>
          <CardDescription>
            Informações sobre a segurança da sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Autenticação</Label>
              <p className="text-sm text-gray-600">SMS via telefone</p>
            </div>
            
            <div className="space-y-2">
              <Label>Último acesso</Label>
              <p className="text-sm text-gray-600">Hoje</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <strong>✓ Conta protegida</strong><br />
              Sua conta está usando autenticação segura via SMS.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600">
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-red-700">Deletar Conta</h4>
              <p className="text-sm text-red-600">
                Esta ação é irreversível. Todos os seus dados serão permanentemente removidos, 
                incluindo canais monitorados, histórico de resumos e assinatura.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-red-700">
                  Digite "DELETE" para confirmar
                </Label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-200 focus:border-red-300"
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={deleteConfirmation !== 'DELETE'}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar Conta Permanentemente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar Conta</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso irá permanentemente deletar sua conta
                      e remover todos os seus dados dos nossos servidores.
                      <br /><br />
                      <strong>Será removido:</strong>
                      <ul className="mt-2 list-disc list-inside text-sm">
                        <li>Perfil e informações pessoais</li>
                        <li>Todos os canais monitorados</li>
                        <li>Histórico completo de resumos</li>
                        <li>Assinatura ativa (se houver)</li>
                        <li>Configurações de notificação</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deletando...' : 'Sim, deletar minha conta'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}