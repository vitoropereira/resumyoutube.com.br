'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { UserVideoNotification, GlobalProcessedVideo, GlobalYoutubeChannel } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Youtube, Clock, ExternalLink, Eye, Calendar } from 'lucide-react'

interface SummaryListProps {
  notifications: (UserVideoNotification & {
    global_processed_videos: GlobalProcessedVideo & {
      global_youtube_channels: GlobalYoutubeChannel
    }
  })[]
}

export function SummaryList({ notifications }: SummaryListProps) {
  const [selectedNotification, setSelectedNotification] = useState<UserVideoNotification & {
    global_processed_videos: GlobalProcessedVideo & {
      global_youtube_channels: GlobalYoutubeChannel
    }
  } | null>(null)
  const searchParams = useSearchParams()

  // Filter notifications based on search params
  const filteredNotifications = notifications.filter(notification => {
    const video = notification.global_processed_videos
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const period = searchParams.get('period')

    // Search filter
    if (search && !video.video_title?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    // Status filter
    if (status === 'sent' && !notification.is_sent) return false
    if (status === 'pending' && notification.is_sent) return false

    // Period filter
    if (period && period !== 'all') {
      const created = new Date(notification.created_at!)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      if (period === 'today' && created < today) return false
      if (period === 'week' && created < weekAgo) return false
      if (period === 'month' && created < monthAgo) return false
    }

    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration (PT4M13S) to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (filteredNotifications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Youtube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Nenhum resumo encontrado com os filtros aplicados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => {
        const video = notification.global_processed_videos
        const channel = video.global_youtube_channels
        return (
        <Card key={notification.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={notification.is_sent ? "default" : "secondary"}>
                    {notification.is_sent ? 'Enviado' : 'Pendente'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {channel.channel_name}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {video.video_title}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {video.video_duration && formatDuration(video.video_duration)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(notification.created_at!)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Resumo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {video.video_title}
                      </DialogTitle>
                      <DialogDescription>
                        Canal: {channel.channel_name} • 
                        Duração: {video.video_duration && formatDuration(video.video_duration)} • 
                        {formatDate(notification.created_at!)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Summary Content */}
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                          {video.summary || 'Resumo não disponível'}
                        </div>
                      </div>
                      
                      {/* Transcript if available */}
                      {video.transcript && (
                        <div className="prose prose-sm max-w-none">
                          <h4 className="font-medium mb-2">Transcrição:</h4>
                          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm max-h-60 overflow-y-auto">
                            {video.transcript}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <Badge variant={notification.is_sent ? "default" : "secondary"}>
                          {notification.is_sent ? 'Enviado para WhatsApp' : 'Aguardando envio'}
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={() => window.open(video.video_url || '', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Ver Vídeo
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(video.video_url || '', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 line-clamp-3">
              {video.summary?.substring(0, 200)}...
            </p>
          </CardContent>
        </Card>
        )
      })}
      
      {/* Pagination could be added here if needed */}
      {filteredNotifications.length > 20 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Mostrando {Math.min(20, filteredNotifications.length)} de {filteredNotifications.length} notificações
          </p>
        </div>
      )}
    </div>
  )
}