"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Zap, TrendingUp } from "lucide-react";
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

export function UsageMeter() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/summary-usage");
      
      if (!response.ok) {
        throw new Error("Failed to fetch usage data");
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load usage data"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { usage, billing } = data;
  const isNearLimit = usage.percentage_used >= 80;
  const isAtLimit = usage.percentage_used >= 100;

  const getProgressColor = () => {
    if (usage.percentage_used >= 100) return "bg-red-500";
    if (usage.percentage_used >= 90) return "bg-orange-500";
    if (usage.percentage_used >= 80) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusBadge = () => {
    if (billing.is_in_trial) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Calendar className="w-3 h-3 mr-1" />
          Trial - {billing.days_left_in_trial} dias restantes
        </Badge>
      );
    }
    
    switch (billing.subscription_status) {
      case "active":
        return <Badge variant="default">Ativo</Badge>;
      case "trialing":
        return <Badge variant="outline">Trial</Badge>;
      case "past_due":
        return <Badge variant="destructive">Vencido</Badge>;
      case "canceled":
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{billing.subscription_status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Uso de Resumos
            </CardTitle>
            <CardDescription>
              Seu consumo mensal de resumos de IA
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {usage.used} de {usage.total_available} resumos usados
            </span>
            <span className="font-medium">
              {usage.percentage_used}%
            </span>
          </div>
          <Progress 
            value={usage.percentage_used} 
            className="h-2"
            color={getProgressColor()}
          />
        </div>

        {/* Usage Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Plano Mensal</p>
            <p className="font-medium">{usage.limit} resumos</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Restantes</p>
            <p className="font-medium">{usage.remaining} resumos</p>
          </div>
          {usage.extra_summaries > 0 && (
            <div className="space-y-1 col-span-2">
              <p className="text-muted-foreground">Pacotes Extras</p>
              <p className="font-medium flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                {usage.extra_summaries} resumos adicionais
              </p>
            </div>
          )}
        </div>

        {/* Reset Date */}
        {billing.reset_date && billing.days_until_reset && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Renovação em {billing.days_until_reset} dias ({new Date(billing.reset_date).toLocaleDateString('pt-BR')})
            </p>
          </div>
        )}

        {/* Warnings */}
        {isAtLimit && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Você atingiu o limite mensal de resumos. Considere fazer upgrade do seu plano ou comprar resumos extras.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Você está próximo do limite mensal. Restam apenas {usage.remaining} resumos.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {(isNearLimit || isAtLimit) && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/billing">Fazer Upgrade</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/billing/extras">Comprar Extras</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}