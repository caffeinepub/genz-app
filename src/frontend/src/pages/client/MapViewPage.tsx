import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { MapPin } from 'lucide-react';

interface MapViewPageProps {
  selectedCategory: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function MapViewPage({ selectedCategory, onNavigate }: MapViewPageProps) {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Map View
            </CardTitle>
            <CardDescription>
              Find service providers near you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Map View Coming Soon</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Interactive map functionality will be available in a future update
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
