'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiCache } from '@/lib/utils/cache';
import { Trash2, RefreshCw } from 'lucide-react';

export function CacheStats() {
  const [stats, setStats] = useState(apiCache.getStats());
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    setStats(apiCache.getStats());
  };

  const clearCache = () => {
    apiCache.clear();
    refreshStats();
  };

  // Rafraîchir les stats toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Raccourci clavier pour afficher/masquer (Ctrl + Shift + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Cache Stats
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Cache API</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>
        <CardDescription className="text-xs">
          Statistiques des appels API cachés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Entrées</div>
            <div className="text-2xl font-bold">{stats.size}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Taux de hit</div>
            <div className="text-2xl font-bold text-green-600">{stats.hitRate}</div>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hits:</span>
            <span className="font-medium text-green-600">{stats.hits}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Misses:</span>
            <span className="font-medium text-orange-600">{stats.misses}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{stats.hits + stats.misses}</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            className="w-full"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Actualiser
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearCache}
            className="w-full"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Vider le cache
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="font-semibold mb-1">TTL configurés:</div>
          <div>• Météo: 30 min</div>
          <div>• Sol: 24 heures</div>
          <div>• Élévation: 1 an</div>
          <div>• Géocodage: 30 jours</div>
        </div>

        <div className="text-xs text-muted-foreground italic">
          Astuce: Ctrl+Shift+C pour afficher/masquer
        </div>
      </CardContent>
    </Card>
  );
}
