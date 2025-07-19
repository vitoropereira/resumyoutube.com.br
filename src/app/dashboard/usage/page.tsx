"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  BarChart3, 
  Clock, 
  Target,
  ArrowUp,
  ArrowDown,
  Activity,
  CreditCard,
  Package,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UsageData {
  usage: {
    limit: number;
    used: number;
    remaining: number;
    extra_summaries: number;
    total_available: number;
    percentage_used: number;
  };
  billing: {
    subscription_status: string;
    is_in_trial: boolean;
    days_left_in_trial: number | null;
    reset_date: string | null;
    days_until_reset: number | null;
  };
  can_generate_summary: boolean;
}

interface HistoryData {
  daily_usage: Array<{
    date: string;
    summaries_generated: number;
  }>;
  monthly_stats: {
    current_month: number;
    previous_month: number;
    growth_percentage: number;
  };
  channels_stats: {
    total_channels: number;
    active_channels: number;
    top_channels: Array<{
      channel_name: string;
      summaries_count: number;
    }>;
  };
}

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch usage data
      const usageResponse = await fetch("/api/user/summary-usage");
      if (!usageResponse.ok) throw new Error("Failed to fetch usage data");
      const usage = await usageResponse.json();
      setUsageData(usage);

      // Fetch history data (will implement API later)
      // For now, using mock data
      const mockHistory: HistoryData = {
        daily_usage: [
          { date: "2024-01-15", summaries_generated: 12 },
          { date: "2024-01-16", summaries_generated: 8 },
          { date: "2024-01-17", summaries_generated: 15 },
          { date: "2024-01-18", summaries_generated: 6 },
          { date: "2024-01-19", summaries_generated: 10 },
          { date: "2024-01-20", summaries_generated: 14 },
          { date: "2024-01-21", summaries_generated: 9 },
        ],
        monthly_stats: {
          current_month: usage.usage.used,
          previous_month: 45,
          growth_percentage: 22.5
        },
        channels_stats: {
          total_channels: 8,
          active_channels: 6,
          top_channels: [
            { channel_name: "Tech Review Brasil", summaries_count: 18 },
            { channel_name: "Programação em Foco", summaries_count: 14 },
            { channel_name: "Startup Brasil", summaries_count: 12 },
          ]
        }
      };
      setHistoryData(mockHistory);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Detalhes de Uso</h1>
        </div>
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Detalhes de Uso</h1>
        </div>
        
        <Alert>
          <AlertDescription>
            {error || "Failed to load usage data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { usage, billing } = usageData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Detalhes de Uso</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Resumos Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.used}</div>
            <p className="text-xs text-muted-foreground">
              de {usage.total_available} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.limit}</div>
            <p className="text-xs text-muted-foreground">
              resumos mensais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Resumos Extras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.extra_summaries}</div>
            <p className="text-xs text-muted-foreground">
              pacotes adicionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Próxima Renovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billing.days_until_reset || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              dias restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso do Uso Mensal
          </CardTitle>
          <CardDescription>
            Acompanhe seu consumo de resumos ao longo do mês
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {usage.used} de {usage.total_available} resumos usados
              </span>
              <span className="text-sm text-muted-foreground">
                {usage.percentage_used}%
              </span>
            </div>
            <Progress 
              value={usage.percentage_used} 
              className="h-3"
              color={getProgressColor(usage.percentage_used)}
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {billing.is_in_trial ? (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  Trial - {billing.days_left_in_trial} dias restantes
                </Badge>
              ) : (
                <Badge variant="default">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Plano Ativo
                </Badge>
              )}
            </div>
            
            {usage.percentage_used >= 80 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/billing">Fazer Upgrade</a>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <a href="/dashboard/billing/extras">Comprar Extras</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limite Mensal:</span>
                  <span className="font-medium">{usage.limit} resumos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Usados:</span>
                  <span className="font-medium">{usage.used} resumos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Restantes:</span>
                  <span className="font-medium text-green-600">{usage.remaining} resumos</span>
                </div>
                {usage.extra_summaries > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pacotes Extras:</span>
                      <span className="font-medium text-yellow-600 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {usage.extra_summaries} resumos
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Cobrança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={billing.subscription_status === 'active' ? 'default' : 'outline'}>
                    {billing.subscription_status === 'active' ? 'Ativo' : billing.subscription_status}
                  </Badge>
                </div>
                
                {billing.is_in_trial && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trial:</span>
                    <span className="font-medium text-blue-600">
                      {billing.days_left_in_trial} dias restantes
                    </span>
                  </div>
                )}
                
                {billing.reset_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Próxima Renovação:</span>
                    <span className="font-medium">
                      {new Date(billing.reset_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uso dos Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historyData.daily_usage.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(day.date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(day.summaries_generated / 20) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {day.summaries_generated}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comparação Mensal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mês Atual:</span>
                    <span className="font-medium">{historyData.monthly_stats.current_month} resumos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mês Anterior:</span>
                    <span className="font-medium">{historyData.monthly_stats.previous_month} resumos</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Variação:</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      historyData.monthly_stats.growth_percentage > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {historyData.monthly_stats.growth_percentage > 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {Math.abs(historyData.monthly_stats.growth_percentage)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {historyData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Channels Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas dos Canais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Canais:</span>
                    <span className="font-medium">{historyData.channels_stats.total_channels}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Canais Ativos:</span>
                    <span className="font-medium text-green-600">
                      {historyData.channels_stats.active_channels}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Atividade:</span>
                    <span className="font-medium">
                      {Math.round((historyData.channels_stats.active_channels / historyData.channels_stats.total_channels) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Canais Mais Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historyData.channels_stats.top_channels.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {channel.channel_name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {channel.summaries_count} resumos
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}