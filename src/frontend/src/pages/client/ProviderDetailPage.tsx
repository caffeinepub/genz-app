import { useGetProvider, useProviderUnlockState, useUnlockProvider, useGetMpesaConfig } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ProviderAvatar } from '../../components/providers/ProviderAvatar';
import { StarRatingDisplay } from '../../components/ratings/StarRatingDisplay';
import { UnlockDetailsCard } from '../../components/providers/UnlockDetailsCard';
import { MpesaUnlockDialog } from '../../components/payments/MpesaUnlockDialog';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';
import { getBusinessTypeLabel } from '../../lib/categories';
import { useState, useEffect, useRef } from 'react';
import { calculateConnectionFee } from '../../utils/fees';
import { formatRemainingTime } from '../../utils/engagementTime';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const queryClient = useQueryClient();
  const { data: provider, isLoading } = useGetProvider(Principal.fromText(providerId), {
    refetchInterval: 3000, // Poll every 3 seconds for live updates
  });
  const { data: isUnlocked } = useProviderUnlockState(providerId);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementRef = useRef<boolean | null>(null);

  // Invalidate and refetch provider data on mount/navigation
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

  if (isLoading || !provider) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('provider-results')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const connectionFee = calculateConnectionFee(provider.rate);
  const remainingTime = formatRemainingTime(provider.engagementEndTime);
  const profilePictureUrl = provider.profilePicture?.blob.getDirectURL();

  // Calculate average rating
  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  return (
    <div className="container py-12">
      {showEngagementNotice && (
        <EngagementStatusNotice
          isEngaged={provider.isEngaged}
          onDismiss={() => setShowEngagementNotice(false)}
        />
      )}

      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('provider-results')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <ProviderAvatar
                  name={provider.name}
                  profilePictureUrl={profilePictureUrl}
                  size="lg"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{provider.name}</h1>
                      {provider.verificationStatus.__kind__ === 'verified' && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      {provider.isEngaged ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Engaged
                          {remainingTime && ` (${remainingTime})`}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {getBusinessTypeLabel(provider.businessType)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRatingDisplay
                      averageRating={avgRating}
                      totalRatings={ratings.length}
                      size="lg"
                    />
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      KES {Number(provider.rate).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {provider.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {provider.location.address || 'Location not specified'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Coordinates: {provider.location.latitude.toFixed(4)}, {provider.location.longitude.toFixed(4)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          {isUnlocked ? (
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${provider.phoneNumber}`}
                      className="font-medium hover:underline"
                    >
                      {provider.phoneNumber}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Principal ID</p>
                    <p className="font-mono text-xs break-all">
                      {provider.principal.toString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UnlockDetailsCard
              connectionFee={connectionFee}
              providerName={provider.name}
              onUnlock={() => setUnlockDialogOpen(true)}
            />
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => onNavigate('map-view', { focusProvider: providerId })}
              >
                <MapPin className="h-4 w-4" />
                View on Map
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MpesaUnlockDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        providerId={providerId}
        amount={Number(connectionFee)}
      />
    </div>
  );
}
