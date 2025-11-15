import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de Bord</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vue d'ensemble</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Bienvenue sur votre tableau de bord économique.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Vos dernières transactions apparaîtront ici.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Aucune notification pour le moment.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
