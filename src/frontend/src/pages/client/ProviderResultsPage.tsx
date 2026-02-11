import { useState, useEffect, useRef } from 'react';
import { useGetProvider } from '../../hooks/useQueries';
import { BusinessType, ProviderProfileView } from '../../backend';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { ProviderPreviewDialog } from '../../components/providers/ProviderPreviewDialog';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';
import { getBusinessTypeLabel } from '../../lib/categories';

interface ProviderResultsPageProps {
  businessType: BusinessType | null;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderResultsPage({ businessType, onNavigate }: ProviderResultsPageProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementRef = useRef<boolean | null>(null);

  // Fetch selected provider when preview is open with polling
  const { data: selectedProvider } = useGetProvider(
    selectedProviderId ? Principal.fromText(selectedProviderId) : Principal.anonymous(),
    {
      enabled: previewOpen && !!selectedProviderId,
      refetchInterval: previewOpen ? 3000 : false, // Poll every 3 seconds when dialog is open
    }
  );

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

  // Mock providers list - in real app this would come from backend search
  const providers: ProviderProfileView[] = [];

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
          {businessType ? getBusinessTypeLabel(businessType) : 'All Providers'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {providers?.length || 0} provider{providers?.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {providers && providers.length > 0 ? (
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
              Provider search functionality will be available soon
            </p>
            <Button onClick={() => onNavigate('categories')} className="mt-4">
              Browse Categories
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
