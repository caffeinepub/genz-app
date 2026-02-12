import { useState, useEffect, useRef } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { useGetProvider, useGetMpesaConfig } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { StarRatingDisplay } from '../../components/ratings/StarRatingDisplay';
import { UnlockDetailsCard } from '../../components/providers/UnlockDetailsCard';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { ProviderAvatar } from '../../components/providers/ProviderAvatar';
import { ArrowLeft, MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { formatRemainingTime } from '../../utils/engagementTime';
import { calculateConnectionFee } from '../../utils/fees';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const queryClient = useQueryClient();
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementRef = useRef<boolean | null>(null);

  const { data: provider, isLoading, isError, error } = useGetProvider(
    Principal.fromText(providerId),
    { refetchInterval: 3000 }
  );

  const { data: mpesaConfig } = useGetMpesaConfig();

  // Invalidate and refetch provider data on mount/provider change
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['provider', providerId] });
  }, [providerId, queryClient]);

  // Detect engagement status changes
  useEffect(() => {
    if (provider && previousEngagementRef.current !== null) {
      if (previousEngagementRef.current !== provider.isEngaged) {
        setShowEngagementNotice(true);
      }
    }
    if (provider) {
      previousEngagementRef.current = provider.isEngaged;
    }
  }, [provider]);

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold">Failed to Load Provider</h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : 'Provider not found'}
          </p>
          <Button onClick={() => onNavigate('categories')} className="mt-4">
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = provider.ratings.length > 0
    ? provider.ratings.reduce((sum, r) => sum + Number(r), 0) / provider.ratings.length
    : 0;

  const remainingTimeText = formatRemainingTime(provider.engagementEndTime);
  const isUnlocked = false; // Placeholder - implement unlock state tracking
  const connectionFee = calculateConnectionFee(provider.rate);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => onNavigate('categories')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>

        {showEngagementNotice && (
          <div className="mb-6">
            <EngagementStatusNotice
              isEngaged={provider.isEngaged}
              onDismiss={() => setShowEngagementNotice(false)}
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ProviderAvatar
                name={provider.name}
                profilePictureUrl={provider.profilePicture?.blob.getDirectURL()}
                size="lg"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                  <CardTitle className="text-2xl">{provider.name}</CardTitle>
                  {provider.verificationStatus.__kind__ === 'verified' && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {provider.isEngaged && (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Engaged
                      {remainingTimeText && ` (${remainingTimeText})`}
                    </Badge>
                  )}
                  {!provider.isEngaged && (
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Available
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {getBusinessTypeLabel(provider.businessType)}
                </CardDescription>
                <div className="mt-3">
                  <StarRatingDisplay 
                    averageRating={averageRating} 
                    totalRatings={provider.ratings.length} 
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="text-muted-foreground">
                {provider.description || 'No description provided'}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Hourly Rate</h3>
              <p className="text-2xl font-bold">
                KES {Number(provider.rate).toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">/hour</span>
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Location</h3>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{provider.location.address}</span>
              </div>
            </div>

            <Separator />

            {!isUnlocked ? (
              <UnlockDetailsCard
                connectionFee={connectionFee}
                providerName={provider.name}
                onUnlock={() => {
                  // Implement unlock logic
                  console.log('Unlock provider details');
                }}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{provider.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Contact via phone</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
