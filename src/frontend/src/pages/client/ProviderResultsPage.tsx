import { useState } from 'react';
import { useSearchProviders, useGetProviderPreview } from '../../hooks/useQueries';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { ProviderPreviewDialog } from '../../components/providers/ProviderPreviewDialog';
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
  
  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  
  const { data: providers, isLoading } = useSearchProviders(
    category?.businessType || null
  );

  const { data: preview } = useGetProviderPreview(
    selectedProviderId ? Principal.fromText(selectedProviderId) : Principal.anonymous()
  );

  const filteredProviders = providers?.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
            size="sm"
            onClick={() => onNavigate('categories')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {category?.label || 'All Services'}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <Button
              onClick={() => onNavigate('map-view', { category: selectedCategory })}
              variant="outline"
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
            placeholder="Search providers..."
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
            <div className="text-center text-muted-foreground">
              No providers found
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
      </div>

      <ProviderPreviewDialog
        preview={preview || null}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
      />
    </div>
  );
}
