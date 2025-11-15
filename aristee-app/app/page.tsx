import { ChantierWizard } from '@/components/chantier/ChantierWizard';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-muted">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8 px-4">
            {/* Wizard principal */}
            <div className="max-w-6xl mx-auto">
              <ChantierWizard />
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
