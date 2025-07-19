"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AddChannelDialogProps {
  children: React.ReactNode
  disabled?: boolean
  maxChannels: number
  currentCount: number
}

export function AddChannelDialog({ children, disabled, maxChannels, currentCount }: AddChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [channelUrl, setChannelUrl] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!channelUrl.trim()) {
        toast.error('URL do canal é obrigatória')
        return
      }

      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: channelUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao adicionar canal')
        return
      }

      toast.success('Canal adicionado com sucesso!')
      setChannelUrl('')
      setOpen(false)
      
      // Refresh the page to show the new channel
      router.refresh()
      
    } catch (error) {
      toast.error('Erro ao adicionar canal')
    } finally {
      setLoading(false)
    }
  }


  if (disabled) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-gray-200 opacity-50 rounded cursor-not-allowed" />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Canal do YouTube</DialogTitle>
          <DialogDescription>
            Adicione um canal do YouTube para começar a receber resumos automáticos.
            Você já tem {currentCount} canais monitorados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-url">URL ou ID do Canal</Label>
            <Input
              id="channel-url"
              placeholder="https://youtube.com/@canalexemplo ou ID do canal"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Cole a URL do canal do YouTube ou apenas o ID do canal
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Canal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}