'use client'

import { Subscription } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, Download, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/stripe'

interface BillingHistoryProps {
  subscription: Subscription | null
}

export function BillingHistory({ subscription }: BillingHistoryProps) {
  // This would typically fetch real billing data from Stripe
  // For now, we'll show mock data based on subscription
  const mockInvoices = subscription ? [
    {
      id: 'inv_1',
      date: new Date().toISOString(),
      amount: subscription.amount_cents || 3990,
      status: 'paid',
      description: 'Resume YouTube Pro - Monthly',
      invoiceUrl: '#'
    },
    {
      id: 'inv_2',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: subscription.amount_cents || 3990,
      status: 'paid',
      description: 'Resume YouTube Pro - Monthly',
      invoiceUrl: '#'
    },
    {
      id: 'inv_3',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: subscription.amount_cents || 3990,
      status: 'paid',
      description: 'Resume YouTube Pro - Monthly',
      invoiceUrl: '#'
    }
  ] : []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Pago</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Histórico de Cobrança
            </CardTitle>
            <CardDescription>
              Visualize suas faturas e histórico de pagamentos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {mockInvoices.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma fatura encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Pago</p>
                <p className="text-lg font-semibold">
                  {formatPrice(mockInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Faturas</p>
                <p className="text-lg font-semibold">{mockInvoices.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Cliente desde</p>
                <p className="text-lg font-semibold">
                  {subscription?.created_at && formatDate(subscription.created_at)}
                </p>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // In a real app, this would download the invoice
                            window.open(invoice.invoiceUrl, '_blank')
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Todas as faturas são enviadas automaticamente para seu email
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}