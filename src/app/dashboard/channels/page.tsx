import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardLayout } from '@/components/dashboard/layout'
import { AddChannelDialog } from '@/components/dashboard/add-channel-dialog'
import { DeleteChannelDialog } from '@/components/dashboard/delete-channel-dialog'
import { YouTubeApiTest } from '@/components/dashboard/youtube-api-test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Youtube } from 'lucide-react'

async function getUserData() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
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

  // Get user channel subscriptions using admin client to bypass RLS issues
  const { data: subscriptions } = await adminSupabase
    .from('user_channel_subscriptions')
    .select(`
      id,
      subscribed_at,
      is_active,
      global_youtube_channels!inner(
        id,
        youtube_channel_id,
        channel_name,
        channel_url,
        channel_description,
        subscriber_count,
        video_count,
        last_check_at,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })

  // Check if user can add more channels using global function
  const { data: canAdd } = await adminSupabase
    .rpc('can_add_global_channel', { user_uuid: user.id })

  return {
    user: profile,
    subscriptions: subscriptions || [],
    canAddChannel: canAdd || false
  }
}

export default async function ChannelsPage() {
  const { user, subscriptions, canAddChannel } = await getUserData()

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
          
          <AddChannelDialog 
            disabled={!canAddChannel}
            maxChannels={user?.max_channels || 3}
            currentCount={subscriptions.length}
          >
            <Button disabled={!canAddChannel}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Canal
            </Button>
          </AddChannelDialog>
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
                {subscriptions.filter(s => s.is_active).length}
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
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">
                inscrições ativas
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
                  ? `${(user?.max_channels || 3) - subscriptions.length} slots restantes`
                  : 'Cancele uma inscrição para adicionar outro canal'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <Youtube className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle>Nenhuma inscrição ativa</CardTitle>
              <CardDescription>
                Inscreva-se em canais do YouTube para monitorar
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <AddChannelDialog 
                maxChannels={user?.max_channels || 3}
                currentCount={0}
              >
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
Fazer Primeira Inscrição
                </Button>
              </AddChannelDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subscriptions.map((subscription) => {
              const channel = subscription.global_youtube_channels
              return (
              <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{channel.channel_name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {channel.subscriber_count?.toLocaleString('pt-BR')} inscritos
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      subscription.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {channel.channel_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {channel.channel_description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Inscrito em {new Date(subscription.subscribed_at).toLocaleDateString('pt-BR')}
                      </span>
                      {channel.last_check_at && (
                        <span>
                          Última verificação: {new Date(channel.last_check_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={channel.channel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver Canal
                        </a>
                      </Button>
                      
                      <DeleteChannelDialog channelId={subscription.id} channelName={channel.channel_name}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancelar Inscrição
                        </Button>
                      </DeleteChannelDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
        
        {/* API Testing */}
        <YouTubeApiTest />
      </div>
    </DashboardLayout>
  )
}