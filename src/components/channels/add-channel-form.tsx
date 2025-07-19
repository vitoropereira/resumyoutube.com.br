'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { getChannelInfo, isValidYouTubeUrl } from '@/lib/youtube'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Loader2, Youtube, ExternalLink } from 'lucide-react'

const formSchema = z.object({
  channelUrl: z
    .string()
    .min(1, 'URL é obrigatória')
    .refine(isValidYouTubeUrl, {
      message: 'URL do YouTube inválida. Use o formato: https://www.youtube.com/@usuario'
    })
})

interface AddChannelFormProps {
  children: React.ReactNode
}

export function AddChannelForm({ children }: AddChannelFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [channelPreview, setChannelPreview] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelUrl: '',
    },
  })

  const handlePreview = async (url: string) => {
    if (!isValidYouTubeUrl(url)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/youtube/channel-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar informações do canal')
      }

      const channelInfo = await response.json()
      setChannelPreview(channelInfo)
    } catch (error) {
      toast.error('Não foi possível buscar informações do canal')
      setChannelPreview(null)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!channelPreview) {
      toast.error('Busque as informações do canal primeiro')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      // Check if user is already subscribed to this global channel
      const { data: globalChannel } = await supabase
        .from('global_youtube_channels')
        .select('id')
        .eq('youtube_channel_id', channelPreview.id)
        .single()

      if (globalChannel) {
        const { data: existingSubscription } = await supabase
          .from('user_channel_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('global_channel_id', globalChannel.id)
          .eq('is_active', true)
          .single()

        if (existingSubscription) {
          toast.error('Você já está inscrito neste canal')
          return
        }
      }

      // Check if user can add more channels
      const { data: canAdd } = await supabase
        .rpc('can_add_global_channel', { user_uuid: user.id })

      if (!canAdd) {
        toast.error('Você atingiu o limite de canais. Remova um canal ou atualize sua assinatura.')
        return
      }

      // Add channel using API endpoint (handles global channel creation)
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: values.channelUrl })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar canal')
      }

      const result = await response.json()

      toast.success('Canal adicionado com sucesso!')
      setOpen(false)
      form.reset()
      setChannelPreview(null)
      router.refresh()
    } catch (error) {
      console.error('Error adding channel:', error)
      toast.error('Erro ao adicionar canal. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
            Cole a URL do canal que você deseja monitorar
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channelUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Canal</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="https://www.youtube.com/@usuario"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setChannelPreview(null)
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handlePreview(field.value)}
                        disabled={!field.value || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Buscar'
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Exemplo: https://www.youtube.com/@username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Channel Preview */}
            {channelPreview && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={channelPreview.thumbnails.medium.url}
                    alt={channelPreview.title}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-lg">{channelPreview.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {parseInt(channelPreview.statistics.subscriberCount).toLocaleString()} inscritos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parseInt(channelPreview.statistics.videoCount).toLocaleString()} vídeos
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {channelPreview.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-green-600">
                    ✓ Canal encontrado
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(form.getValues('channelUrl'), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver Canal
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!channelPreview || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Youtube className="mr-2 h-4 w-4" />
                    Adicionar Canal
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}