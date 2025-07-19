import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardLayout } from "@/components/dashboard/layout";
import { AddChannelDialog } from "@/components/dashboard/add-channel-dialog";
import { DeleteChannelDialog } from "@/components/dashboard/delete-channel-dialog";
import { YouTubeApiTest } from "@/components/dashboard/youtube-api-test";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Youtube, FileText, Users, BarChart3 } from "lucide-react";

async function getUserData() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user channel subscriptions using admin client to bypass RLS issues
  const { data: subscriptions } = await adminSupabase
    .from("user_channel_subscriptions")
    .select(
      `
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
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("subscribed_at", { ascending: false });

  // Get summary counts for each channel (simplified)
  const subscriptionsWithSummaries = (subscriptions || []).map((subscription) => {
    return {
      ...subscription,
      summaryCount: 0, // Will be calculated later when we have proper data
    };
  });

  // Since channels are unlimited, always allow adding channels
  // Only limit based on summary quota (handled in the backend)
  const canAdd = true;
  
  console.log("Can add channel:", canAdd);
  return {
    user: profile,
    subscriptions: subscriptionsWithSummaries || [],
    canAddChannel: canAdd,
  };
}

export default async function ChannelsPage() {
  const { user, subscriptions, canAddChannel } = await getUserData();

  return (
    <DashboardLayout title="Meus Canais" user={user}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gerenciar Canais
            </h2>
            <p className="text-gray-600">
              Adicione e gerencie os canais do YouTube que você deseja monitorar
            </p>
          </div>

          <AddChannelDialog
            disabled={!canAddChannel}
            maxChannels={999} // Unlimited channels
            currentCount={subscriptions.length}
          >
            <Button disabled={!canAddChannel}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Canal
            </Button>
          </AddChannelDialog>
        </div>

        {/* Summary Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Uso de Resumos Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resumos utilizados</span>
                <span>
                  {user?.monthly_summary_used || 0}/{user?.monthly_summary_limit || 0}
                  {user?.extra_summaries && user.extra_summaries > 0 && (
                    <span className="text-green-600"> + {user.extra_summaries} extras</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(
                      ((user?.monthly_summary_used || 0) / (user?.monthly_summary_limit || 1)) * 100, 
                      100
                    )}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {user?.summary_reset_date && (
                  <span>
                    Próximo reset: {new Date(user.summary_reset_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Canais Ativos
              </CardTitle>
              <Youtube className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions.filter((s) => s.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                monitoramento ativo
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
              <p className="text-xs text-muted-foreground">inscrições ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resumos Mensais
              </CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.monthly_summary_used || 0}/{user?.monthly_summary_limit || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                utilizados este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resumos Extras
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.extra_summaries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                créditos extras
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
                Inscreva-se em canais do YouTube para monitorar.
                <br />
                <strong>Lembre-se:</strong> Canais são ilimitados, mas você tem {user?.monthly_summary_limit || 0} resumos por mês.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <AddChannelDialog
                maxChannels={999} // Unlimited channels
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
              const channel = subscription.global_youtube_channels;
              return (
                <Card
                  key={subscription.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                          <Youtube className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {channel.channel_name}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {channel.subscriber_count?.toLocaleString("pt-BR")}{" "}
                            inscritos
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          subscription.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {subscription.is_active ? "Ativo" : "Inativo"}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div>
                          <strong>Inscrito em:</strong>{" "}
                          {new Date(
                            subscription.subscribed_at
                          ).toLocaleDateString("pt-BR")}
                        </div>
                        {channel.last_check_at && (
                          <div>
                            <strong>Última verificação:</strong>{" "}
                            {new Date(channel.last_check_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                        {channel.video_count && (
                          <div>
                            <strong>Total de vídeos:</strong>{" "}
                            {channel.video_count.toLocaleString("pt-BR")}
                          </div>
                        )}
                        {channel.subscriber_count && (
                          <div>
                            <strong>Inscritos:</strong>{" "}
                            {channel.subscriber_count.toLocaleString("pt-BR")}
                          </div>
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

                        <DeleteChannelDialog
                          channelId={subscription.id}
                          channelName={channel.channel_name}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancelar Inscrição
                          </Button>
                        </DeleteChannelDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* API Testing */}
        <YouTubeApiTest />
      </div>
    </DashboardLayout>
  );
}
