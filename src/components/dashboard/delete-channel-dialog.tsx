"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

interface DeleteChannelDialogProps {
  children: React.ReactNode
  channelId: string
  channelName: string
}

export function DeleteChannelDialog({ children, channelId, channelName }: DeleteChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/channels?channelId=${channelId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao remover canal')
        return
      }

      toast.success('Canal removido com sucesso!')
      setOpen(false)
      
      // Refresh the page to remove the channel from the list
      router.refresh()
      
    } catch (error) {
      toast.error('Erro ao remover canal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remover Canal</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover o canal "{channelName}"? 
            Esta ação não pode ser desfeita e você perderá todos os resumos associados a este canal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              'Remover Canal'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}