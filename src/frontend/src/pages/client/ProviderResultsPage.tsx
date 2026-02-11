import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchProviders, useGetProviderPreview } from '../../hooks/useQueries';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { ProviderPreviewDialog } from '../../components/providers/ProviderPreviewDialog';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Map, Search } from 'lucide-react';
import { getCategoryById } from '../../lib/categories';
import { Principal } from '@icp-sdk/core/principal';

interface ProviderResultsPageProps {
  selectedCategory: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderResultsPage({ selectedCategory, onNavigate }: ProviderResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementStatus = useRef<boolean | null>(null);
  
  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  
  const { data: providers, isLoading } = useSearchProviders(
    category?.businessType || null
  );

  // Enable polling when preview dialog is open (3 second interval)
  const { data: preview } = useGetProviderPreview(
    selectedProviderId ? Principal.fromText(selectedProviderId) : Principal.anonymous(),
    {
      enabled: previewOpen && !!selectedProviderId,
      refetchInterval: previewOpen && selectedProviderId ? 3000 : false,
    }
  );

  // Detect engagement status changes
  useEffect(() => {
    if (preview && previewOpen) {
      const currentStatus = preview.isEngaged;
      
      // Only show notice if status actually changed (not on initial load)
      if (previousEngagementStatus.current !== null && previousEngagementStatus.current !== currentStatus) {
        setShowEngagementNotice(true);
      }
      
      previousEngagementStatus.current = currentStatus;
    }
  }, [preview, previewOpen]);

  // Reset engagement tracking when dialog closes
  useEffect(() => {
    if (!previewOpen) {
      previousEngagementStatus.current = null;
      setShowEngagementNotice(false);
    }
  }, [previewOpen]);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery || !providers) return providers || [];
    
    return providers.filter((provider) =>
      provider.name.toLowerCase().includes(normalizedQuery)
    );
  }, [providers, searchQuery]);

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
    setPreviewOpen(false);
    onNavigate('map-view', { 
      category: selectedCategory,
      focusProvider: selectedProviderId 
    });
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('categories')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {category ? category.label : 'All Providers'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate('map-view', { category: selectedCategory })}
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              View on Map
            </Button>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by provider name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading providers...</p>
            </div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No providers found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery 
                  ? `No providers match "${searchQuery}"`
                  : 'Try selecting a different category or check back later'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.principal.toString()}
                provider={provider}
                onClick={() => handleProviderClick(provider.principal.toString())}
              />
            ))}
          </div>
        )}

        <ProviderPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          preview={preview || null}
          onViewDetails={handleViewDetails}
          onViewOnMap={handleViewOnMap}
          engagementNotice={
            showEngagementNotice && preview ? (
              <EngagementStatusNotice
                isEngaged={preview.isEngaged}
                onDismiss={() => setShowEngagementNotice(false)}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
