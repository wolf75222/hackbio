'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreasuryChart } from '@/components/dashboard/TreasuryChart';
import { mockTreasuryData } from '@/lib/constants/mockTreasuryData';
import { Search, Sparkles, FileText, Receipt, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TresoreriePage() {
  const data = mockTreasuryData;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Économie</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 w-64 h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Cowgito
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Opération Technique
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Receipt className="w-4 h-4" />
              Scanner une Facture
            </Button>
            <select className="h-9 px-3 rounded-md border border-gray-200 text-sm bg-white">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="tresorerie" className="w-full">
              <TabsList className="bg-white border border-gray-200 p-1">
                <TabsTrigger value="graphique" className="gap-2">
                  <div className="w-4 h-4 text-primary">📊</div>
                  Graphique de Trésorerie
                </TabsTrigger>
                <TabsTrigger value="tableau" className="gap-2">
                  <div className="w-4 h-4">📋</div>
                  Tableau de Trésorerie
                </TabsTrigger>
                <TabsTrigger value="transactions" className="gap-2">
                  <div className="w-4 h-4">📝</div>
                  Liste des Transactions
                </TabsTrigger>
                <TabsTrigger value="emprunts" className="gap-2">
                  <div className="w-4 h-4">💳</div>
                  Emprunts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {data.balance.label}
                  </CardTitle>
                  <Badge variant={data.balance.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {data.balance.changeLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data.balance.value}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {data.expectedIncome.label}
                  </CardTitle>
                  <Badge variant={data.expectedIncome.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {data.expectedIncome.changeLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data.expectedIncome.value}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {data.expectedExpenses.label}
                  </CardTitle>
                  <Badge variant={data.expectedExpenses.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {data.expectedExpenses.changeLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data.expectedExpenses.value}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {data.vatRecoverable.label}
                  </CardTitle>
                  <Badge variant={data.vatRecoverable.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {data.vatRecoverable.changeLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data.vatRecoverable.value}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {data.freeCashFlow.label}
                  </CardTitle>
                  <Badge variant={data.freeCashFlow.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {data.freeCashFlow.changeLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {data.freeCashFlow.value}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning Alert */}
          <Alert className="mb-6 bg-purple-50 border-purple-200">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <div className="ml-2">
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Coussin de sécurité entamé !
              </h3>
              <p className="text-sm text-purple-800">
                {data.securityCushion.warning}
              </p>
            </div>
          </Alert>

          {/* Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Graphique de Trésorerie 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TreasuryChart
                data={data.monthlyData}
                securityCushion={data.securityCushion.amount}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Adapter Ma Stratégie de Factures
            </Button>
            <Button variant="outline">
              Simuler un Emprunt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
