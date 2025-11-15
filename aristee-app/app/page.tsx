import { ChantierForm } from '@/components/chantier/ChantierForm';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-muted">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">🌲 Aristée</h1>
                <p className="text-sm text-muted-foreground">
                  Estimation intelligente de chantiers forestiers
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto py-8 px-4">
            {/* Formulaire principal */}
            <div className="max-w-6xl mx-auto">
              <ChantierForm />
            </div>

            {/* Footer */}
            <footer className="mt-16 text-center text-sm text-muted-foreground">
              <p>
                Données météo : <a href="https://open-meteo.com" target="_blank" rel="noopener" className="underline">Open-Meteo</a>
                {' • '}
                Données sol : <a href="https://www.isric.org/explore/soilgrids" target="_blank" rel="noopener" className="underline">SoilGrids</a>
                {' • '}
                Élévation : <a href="https://open-elevation.com" target="_blank" rel="noopener" className="underline">Open-Elevation</a>
              </p>
              <p className="mt-2">
                © 2025 Aristée - MVP Hackathon
              </p>
            </footer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
