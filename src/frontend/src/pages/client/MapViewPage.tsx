import { useSearchProviders } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getCategoryById } from '../../lib/categories';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

interface MapViewPageProps {
  selectedCategory: string | null;
  focusProvider?: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function MapViewPage({ selectedCategory, focusProvider, onNavigate }: MapViewPageProps) {
  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const { data: providers } = useSearchProviders(category?.businessType || null);

  const hasGoogleMapsConfig = false; // Google Maps not configured

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('results', { category: selectedCategory })}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Map View - {category?.label || 'All Services'}
        </h1>

        {!hasGoogleMapsConfig ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map View Unavailable</AlertTitle>
            <AlertDescription>
              Google Maps integration is not configured. You can still browse providers in list view
              or use the "Open in Google Maps" link from provider previews to view locations externally.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="aspect-video rounded-lg border bg-muted">
            {/* Google Maps would be embedded here when configured */}
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Map View
              {focusProvider && (
                <span className="ml-2 text-sm">
                  (Focused on provider: {focusProvider.substring(0, 8)}...)
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">Providers in this area</h2>
          <div className="space-y-2">
            {providers?.map((provider) => (
              <div
                key={provider.principal.toString()}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">{provider.location.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onNavigate('provider-detail', { provider: provider.principal.toString() })
                  }
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
