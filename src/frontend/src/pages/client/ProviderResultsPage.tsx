import { useState, useEffect, useRef } from 'react';
import { useGetProvider, useGetProviderResults } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { ProviderProfileView } from '../../backend';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { ProviderPreviewDialog } from '../../components/providers/ProviderPreviewDialog';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

interface ProviderResultsPageProps {
  categoryId: string | null;
  categoryLabel: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderResultsPage({ categoryId, categoryLabel, onNavigate }: ProviderResultsPageProps) {
  const queryClient = useQueryClient();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementRef = useRef<boolean | null>(null);

  // Fetch provider results from backend using categoryId
  const { 
    data: providers, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetProviderResults(categoryId);

  // Fetch selected provider when preview is open with polling
  const { data: selectedProvider } = useGetProvider(
    selectedProviderId ? Principal.fromText(selectedProviderId) : Principal.anonymous(),
    {
      enabled: previewOpen && !!selectedProviderId,
      refetchInterval: previewOpen ? 3000 : false, // Poll every 3 seconds when dialog is open
    }
  );

  // Invalidate and refetch provider results on mount/navigation
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['providerResults', categoryId] });
  }, [categoryId, queryClient]);

  // Detect engagement status changes
  useEffect(() => {
    if (selectedProvider && previousEngagementRef.current !== null) {
      if (previousEngagementRef.current !== selectedProvider.isEngaged) {
        setShowEngagementNotice(true);
      }
    }
    if (selectedProvider) {
      previousEngagementRef.current = selectedProvider.isEngaged;
    }
  }, [selectedProvider]);

  // Reset engagement tracking when dialog closes
  useEffect(() => {
    if (!previewOpen) {
      previousEngagementRef.current = null;
      setShowEngagementNotice(false);
    }
  }, [previewOpen]);

  const handleProviderClick = (providerId: string) => {
    setSelectedProviderId(providerId);
    setPreviewOpen(true);
  };

  const handleViewDetails = () => {
    if (selectedProviderId) {
      setPreviewOpen(false);
      onNavigate('provider-detail', { provider: selectedProviderId });
    }
  };

  const handleViewOnMap = () => {
    if (selectedProviderId) {
      setPreviewOpen(false);
      onNavigate('map-view', { focusProvider: selectedProviderId });
    }
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('categories')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {categoryLabel || 'All Providers'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? 'Loading...' : `${providers?.length || 0} provider${providers?.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4 rounded-lg border p-6">
              <div className="flex justify-center">
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Failed to Load Providers</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred while loading providers'}
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      ) : providers && providers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.principal.toString()}
              provider={provider}
              onClick={() => handleProviderClick(provider.principal.toString())}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">No Providers Found</h2>
            <p className="mt-2 text-muted-foreground">
              {categoryLabel 
                ? `There are currently no providers in the ${categoryLabel} category.`
                : 'There are currently no providers available.'}
            </p>
            <Button onClick={() => onNavigate('categories')} className="mt-4">
              Browse Other Categories
            </Button>
          </div>
        </div>
      )}

      <ProviderPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        provider={selectedProvider || null}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        engagementNotice={
          showEngagementNotice && selectedProvider ? (
            <EngagementStatusNotice
              isEngaged={selectedProvider.isEngaged}
              onDismiss={() => setShowEngagementNotice(false)}
            />
          ) : undefined
        }
      />
    </div>
  );
}
