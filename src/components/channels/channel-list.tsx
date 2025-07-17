'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { YoutubeChannel } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Youtube, MoreHorizontal, ExternalLink, Trash2, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { AddChannelForm } from './add-channel-form'

interface ChannelListProps {
  channels: YoutubeChannel[]
  canAddMore: boolean
}

export function ChannelList({ channels, canAddMore }: ChannelListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleActive = async (channelId: string, currentStatus: boolean) => {
    setIsLoading(channelId)
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .update({ is_active: !currentStatus })
        .eq('id', channelId)

      if (error) throw error

      toast.success(
        !currentStatus 
          ? 'Canal ativado com sucesso!' 
          : 'Canal desativado com sucesso!'
      )
      router.refresh()
    } catch (error) {
      toast.error('Erro ao atualizar canal')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    setIsLoading(channelId)
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId)

      if (error) throw error

      toast.success('Canal removido com sucesso!')
      setDeleteDialog(null)
      router.refresh()
    } catch (error) {
      toast.error('Erro ao remover canal')
    } finally {
      setIsLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-4">
      {/* Add Channel Card */}
      {canAddMore && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Youtube className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Adicionar Novo Canal
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Monitore mais canais do YouTube para receber resumos automáticos
            </p>
            <AddChannelForm>
              <Button>
                Adicionar Canal
              </Button>
            </AddChannelForm>
          </CardContent>
        </Card>
      )}

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card key={channel.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">
                      {channel.channel_name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={channel.is_active ? "default" : "secondary"}>
                        {channel.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => window.open(channel.channel_url || '', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver no YouTube
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialog(channel.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Canal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {channel.subscriber_count?.toLocaleString() || '0'} inscritos
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  Adicionado em {formatDate(channel.created_at!)}
                </div>
              </div>

              {/* Toggle Active */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium">
                  Monitoramento
                </span>
                <Switch
                  checked={channel.is_active || false}
                  onCheckedChange={() => handleToggleActive(channel.id, channel.is_active || false)}
                  disabled={isLoading === channel.id}
                />
              </div>

              {/* Last Video Info */}
              {channel.last_video_id && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Último vídeo processado
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Canal</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este canal? Todos os resumos relacionados serão mantidos, mas novos vídeos não serão monitorados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDeleteChannel(deleteDialog)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading === deleteDialog}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}