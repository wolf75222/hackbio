'use client';

import { Home, BarChart3, History, Settings, HelpCircle, TrendingUp } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Données mock pour l'historique
const recentChantiers = [
  {
    name: 'Parcelle 87 - Landes',
    date: '12/11/2025',
    marge: 28,
    status: 'completed' as const,
  },
  {
    name: 'Forêt de Tronçais',
    date: '08/11/2025',
    marge: 15,
    status: 'completed' as const,
  },
  {
    name: 'Vosges Nord',
    date: '03/11/2025',
    marge: 8,
    status: 'rejected' as const,
  },
  {
    name: 'Sologne Est',
    date: '29/10/2025',
    marge: 32,
    status: 'completed' as const,
  },
];

// Statistiques mock
const mockStats = {
  chantiersAnalyses: 47,
  tauxAcceptation: 68,
  margeAverageMoyenne: 24,
  economiesRealisees: 85000,
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <div>
            <h2 className="font-bold text-lg">Aristée</h2>
            <p className="text-xs text-muted-foreground">v1.0 - MVP</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <Home className="w-4 h-4" />
                    <span>Accueil</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#statistiques">
                    <BarChart3 className="w-4 h-4" />
                    <span>Statistiques</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#historique">
                    <History className="w-4 h-4" />
                    <span>Historique</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#aide">
                    <HelpCircle className="w-4 h-4" />
                    <span>Aide</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#parametres">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Statistiques rapides */}
        <SidebarGroup>
          <SidebarGroupLabel>Statistiques</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-3">
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Chantiers analysés</span>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{mockStats.chantiersAnalyses}</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Taux d'acceptation</div>
                  <div className="text-2xl font-bold">{mockStats.tauxAcceptation}%</div>
                  <div className="text-xs text-green-600 mt-1">+12% ce mois</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Marge moyenne</div>
                  <div className="text-2xl font-bold">{mockStats.margeAverageMoyenne}%</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="text-xs text-green-700 mb-1">Économies réalisées</div>
                  <div className="text-xl font-bold text-green-700">
                    {(mockStats.economiesRealisees / 1000).toFixed(0)}k €
                  </div>
                  <div className="text-xs text-green-600 mt-1">Chantiers refusés</div>
                </CardContent>
              </Card>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Historique récent */}
        <SidebarGroup>
          <SidebarGroupLabel>Historique récent</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2">
              {recentChantiers.map((chantier, index) => (
                <Card key={index} className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-xs font-medium line-clamp-1">{chantier.name}</div>
                      {chantier.status === 'completed' ? (
                        <Badge variant="default" className="text-xs bg-green-500 h-5">
                          ✓
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs h-5">
                          ✗
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{chantier.date}</span>
                      <span
                        className={`text-xs font-semibold ${
                          chantier.marge >= 20
                            ? 'text-green-600'
                            : chantier.marge >= 15
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {chantier.marge}% marge
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">Entreprise Demo</div>
          <div>demo@aristee.fr</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
