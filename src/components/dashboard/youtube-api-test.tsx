'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Play, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  type: 'success' | 'error' | 'info'
  message: string
  data?: any
}

export function YouTubeApiTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const testCheckNewVideos = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Verificando novos vídeos...' })

    try {
      const response = await fetch('/api/youtube/process-new-videos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `Encontrados ${data.available_videos} novos vídeos disponíveis`,
          data: data.channels
        })
      } else {
        addResult({ 
          type: 'error', 
          message: `Erro: ${data.error}`,
          data
        })
      }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testProcessNewVideos = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Processando novos vídeos...' })

    try {
      const response = await fetch('/api/youtube/process-new-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `${data.message} - ${data.total_new_videos} novos vídeos processados`,
          data: data.processed_channels
        })
      } else {
        addResult({ 
          type: 'error', 
          message: `Erro: ${data.error}`,
          data
        })
      }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testGetProcessedVideos = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Buscando vídeos processados...' })

    try {
      const response = await fetch('/api/processed-videos?limit=5')
      const data = await response.json()

      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `Encontrados ${data.videos.length} vídeos processados`,
          data: data.videos
        })
      } else {
        addResult({ 
          type: 'error', 
          message: `Erro: ${data.error}`,
          data
        })
      }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testGetStats = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Buscando estatísticas...' })

    try {
      const response = await fetch('/api/processed-videos/stats')
      const data = await response.json()

      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `Estatísticas: ${data.overview.totalVideos} vídeos total`,
          data: data.overview
        })
      } else {
        addResult({ 
          type: 'error', 
          message: `Erro: ${data.error}`,
          data
        })
      }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const debugChannels = async () => {
    setIsLoading(true)
    addResult({ type: 'info', message: 'Debugando canais...' })

    try {
      const response = await fetch('/api/debug/channels')
      const data = await response.json()

      if (response.ok) {
        addResult({ 
          type: 'success', 
          message: `Canais encontrados: ${data.adminChannels.data?.length || 0}`,
          data
        })
      } else {
        addResult({ 
          type: 'error', 
          message: `Erro: ${data.error}`,
          data
        })
      }
    } catch (error) {
      addResult({ 
        type: 'error', 
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Teste da API do YouTube
        </CardTitle>
        <CardDescription>
          Teste as funcionalidades da integração com YouTube API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testCheckNewVideos} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Verificar Novos Vídeos
          </Button>
          
          <Button 
            onClick={testProcessNewVideos} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Processar Vídeos
          </Button>
          
          <Button 
            onClick={testGetProcessedVideos} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Listar Processados
          </Button>
          
          <Button 
            onClick={testGetStats} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Estatísticas
          </Button>
          
          <Button 
            onClick={debugChannels} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Debug Canais
          </Button>
          
          <Button 
            onClick={clearResults} 
            variant="ghost"
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-start gap-2">
                  <Badge variant={
                    result.type === 'success' ? 'default' : 
                    result.type === 'error' ? 'destructive' : 'secondary'
                  }>
                    {result.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{result.message}</p>
                    {result.data && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}