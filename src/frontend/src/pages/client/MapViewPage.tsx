import { Button } from '../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { BusinessType } from '../../backend';

interface MapViewPageProps {
  selectedCategory: BusinessType | null;
  focusProvider?: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function MapViewPage({ selectedCategory, focusProvider, onNavigate }: MapViewPageProps) {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('results', { businessType: selectedCategory })}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Map View - {selectedCategory ? getBusinessTypeLabel(selectedCategory) : 'All Services'}
        </h1>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Map View Unavailable</AlertTitle>
          <AlertDescription>
            Map view and provider search functionality will be available in a future update.
            Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
