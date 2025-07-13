import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/layout'
import { ChannelList } from '@/components/channels/channel-list'
import { AddChannelForm } from '@/components/channels/add-channel-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Youtube } from 'lucide-react'

async function getUserData() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user channels
  const { data: channels } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Check if user can add more channels
  const { data: canAdd } = await supabase
    .rpc('can_add_channel', { user_uuid: user.id })

  return {
    user: profile,
    channels: channels || [],
    canAddChannel: canAdd
  }
}

export default async function ChannelsPage() {
  const { user, channels, canAddChannel } = await getUserData()

  return (
    <DashboardLayout title="Meus Canais" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Canais</h2>
            <p className="text-gray-600">
              Adicione e gerencie os canais do YouTube que você deseja monitorar
            </p>
          </div>
          
          {canAddChannel && (
            <AddChannelForm>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Canal
              </Button>
            </AddChannelForm>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Canais Ativos
              </CardTitle>
              <Youtube className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {channels.filter(c => c.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                de {user?.max_channels || 3} permitidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Canais
              </CardTitle>
              <Youtube className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{channels.length}</div>
              <p className="text-xs text-muted-foreground">
                canais adicionados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {canAddChannel ? 'Pode Adicionar' : 'Limite Atingido'}
              </div>
              <p className="text-xs text-muted-foreground">
                {canAddChannel 
                  ? `${(user?.max_channels || 3) - channels.length} slots restantes`
                  : 'Remova um canal para adicionar outro'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Channels List */}
        {channels.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <Youtube className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle>Nenhum canal adicionado</CardTitle>
              <CardDescription>
                Comece adicionando canais do YouTube para monitorar
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {canAddChannel ? (
                <AddChannelForm>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Canal
                  </Button>
                </AddChannelForm>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você atingiu o limite de canais. Atualize sua assinatura para adicionar mais.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <ChannelList channels={channels} canAddMore={canAddChannel} />
        )}
      </div>
    </DashboardLayout>
  )
}