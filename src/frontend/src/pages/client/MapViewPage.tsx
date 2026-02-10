import { useSearchProviders } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getCategoryById } from '../../lib/categories';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

interface MapViewPageProps {
  selectedCategory: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function MapViewPage({ selectedCategory, onNavigate }: MapViewPageProps) {
  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const { data: providers } = useSearchProviders(category?.businessType || null);

  const hasGoogleMapsKey = false; // Would check VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('results', { category: selectedCategory })}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List View
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
          <p className="mt-1 text-muted-foreground">
            {providers?.length || 0} provider{providers?.length !== 1 ? 's' : ''} in this area
          </p>
        </div>

        {!hasGoogleMapsKey ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map View Unavailable</AlertTitle>
            <AlertDescription>
              Google Maps is not configured. Please use the list view to browse providers.
              You can still see all providers and their locations in the list.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="aspect-video rounded-lg border border-border bg-muted">
            {/* Google Maps would be rendered here when configured */}
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Map loading...
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={() => onNavigate('results', { category: selectedCategory })}>
            View as List
          </Button>
        </div>
      </div>
    </div>
  );
}
