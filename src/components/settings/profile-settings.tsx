'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2, Save, User as UserIcon } from 'lucide-react'
import type { AuthUser } from '@supabase/supabase-js'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

interface ProfileSettingsProps {
  user: User | null
  authUser: AuthUser
}

export function ProfileSettings({ user, authUser }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || authUser.email || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: values.name,
          email: values.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)

      if (error) throw error

      toast.success('Perfil atualizado com sucesso!')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserIcon className="mr-2 h-5 w-5" />
          Informações do Perfil
        </CardTitle>
        <CardDescription>
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este nome será usado em comunicações e no dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="seu@email.com" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email usado para autenticação e comunicações importantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Read-only fields */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <Input value={authUser.id} disabled />
                <p className="text-sm text-muted-foreground">
                  Identificador único da sua conta
                </p>
              </div>

              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <Input 
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'} 
                  disabled 
                />
                <p className="text-sm text-muted-foreground">
                  Data em que sua conta foi criada
                </p>
              </div>

              <div className="space-y-2">
                <Label>Última Atualização</Label>
                <Input 
                  value={user?.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'} 
                  disabled 
                />
                <p className="text-sm text-muted-foreground">
                  Última vez que suas informações foram atualizadas
                </p>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}