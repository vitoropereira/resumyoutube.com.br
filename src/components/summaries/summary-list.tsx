'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProcessedVideoWithChannel } from '@/lib/types'
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
  summaries: ProcessedVideoWithChannel[]
}

export function SummaryList({ summaries }: SummaryListProps) {
  const [selectedSummary, setSelectedSummary] = useState<ProcessedVideoWithChannel | null>(null)
  const searchParams = useSearchParams()

  // Filter summaries based on search params
  const filteredSummaries = summaries.filter(summary => {
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const period = searchParams.get('period')

    // Search filter
    if (search && !summary.video_title?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    // Status filter
    if (status === 'sent' && !summary.sent_to_user) return false
    if (status === 'pending' && summary.sent_to_user) return false

    // Period filter
    if (period && period !== 'all') {
      const created = new Date(summary.created_at!)
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

  if (filteredSummaries.length === 0) {
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
      {filteredSummaries.map((summary) => (
        <Card key={summary.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={summary.sent_to_user ? "default" : "secondary"}>
                    {summary.sent_to_user ? 'Enviado' : 'Pendente'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {summary.youtube_channels?.channel_name}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {summary.video_title}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {summary.video_duration && formatDuration(summary.video_duration)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(summary.created_at!)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSummary(summary)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Resumo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {summary.video_title}
                      </DialogTitle>
                      <DialogDescription>
                        Canal: {summary.youtube_channels?.channel_name} • 
                        Duração: {summary.video_duration && formatDuration(summary.video_duration)} • 
                        {formatDate(summary.created_at!)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Summary Content */}
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                          {summary.summary || 'Resumo não disponível'}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <Badge variant={summary.sent_to_user ? "default" : "secondary"}>
                          {summary.sent_to_user ? 'Enviado para WhatsApp' : 'Aguardando envio'}
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={() => window.open(summary.video_url || '', '_blank')}
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
                  onClick={() => window.open(summary.video_url || '', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 line-clamp-3">
              {summary.summary?.substring(0, 200)}...
            </p>
          </CardContent>
        </Card>
      ))}
      
      {/* Pagination could be added here if needed */}
      {filteredSummaries.length > 20 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Mostrando {Math.min(20, filteredSummaries.length)} de {filteredSummaries.length} resumos
          </p>
        </div>
      )}
    </div>
  )
}