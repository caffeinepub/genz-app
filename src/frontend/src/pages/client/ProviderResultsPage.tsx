import { useState } from 'react';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { ProviderPreviewDialog } from '../../components/providers/ProviderPreviewDialog';
import { useGetProviderResults } from '../../hooks/useQueries';
import { ProviderProfileView } from '../../backend';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { getCategoryById } from '../../lib/categories';

interface ProviderResultsPageProps {
  categoryId: string | null;
  categoryLabel: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function ProviderResultsPage({
  categoryId,
  categoryLabel,
  onNavigate,
}: ProviderResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfileView | null>(null);

  // Convert categoryId to BusinessType for the query
  const category = categoryId ? getCategoryById(categoryId) : null;
  const businessType = category?.businessType ?? null;

  const {
    data: providers = [],
    isLoading,
    error,
  } = useGetProviderResults(businessType);

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const handleOpenPreview = (provider: ProviderProfileView) => {
    setSelectedProvider(provider);
    // Start polling when dialog opens
    const interval = setInterval(() => {
      // Trigger refetch by invalidating the query
    }, 3000);
    setPollingInterval(interval);
  };

  const handleClosePreview = () => {
    setSelectedProvider(null);
    // Stop polling when dialog closes
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      provider.displayName.toLowerCase().includes(query) ||
      provider.description.toLowerCase().includes(query) ||
      provider.location.address.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading providers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Failed to load providers</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{categoryLabel}</h1>
        <p className="mt-2 text-muted-foreground">
          {categoryId
            ? `Browse verified service providers in ${categoryLabel}`
            : 'Browse all verified service providers'}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProviders.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">No providers found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search terms'
                : categoryId
                  ? `No providers available in ${categoryLabel} yet`
                  : 'No providers available yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.principal.toString()}
              provider={provider}
              onClick={() => handleOpenPreview(provider)}
            />
          ))}
        </div>
      )}

      {selectedProvider && (
        <ProviderPreviewDialog
          provider={selectedProvider}
          open={!!selectedProvider}
          onOpenChange={(open) => {
            if (!open) handleClosePreview();
          }}
          onViewDetails={() => {
            handleClosePreview();
            onNavigate('provider-detail', {
              providerId: selectedProvider.principal.toString(),
            });
          }}
        />
      )}
    </div>
  );
}
