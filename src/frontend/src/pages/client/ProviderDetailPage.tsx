import { useGetProvider, useProviderUnlockState, useUnlockProvider, useGetMpesaConfig } from '../../hooks/useQueries';
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
  const { data: provider, isLoading } = useGetProvider(Principal.fromText(providerId), {
    refetchInterval: 3000, // Poll every 3 seconds for live updates
  });
  const { data: isUnlocked } = useProviderUnlockState(providerId);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementRef = useRef<boolean | null>(null);

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

  if (!provider) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Provider not found</p>
            <Button onClick={() => onNavigate('categories')} className="mt-4">
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const profilePictureUrl = provider.profilePicture?.blob.getDirectURL();
  const connectionFee = calculateConnectionFee(provider.rate);
  const remainingTimeText = formatRemainingTime(provider.engagementEndTime);

  const getVerificationBadge = () => {
    if ('verified' in provider.verificationStatus) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    if ('pending' in provider.verificationStatus) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    if ('rejected' in provider.verificationStatus) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return <Badge variant="outline">Unverified</Badge>;
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => onNavigate('results')}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <ProviderAvatar
                  name={provider.name}
                  profilePictureUrl={profilePictureUrl}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{provider.name}</CardTitle>
                      <div className="mt-2 flex items-center gap-2">
                        {getVerificationBadge()}
                        <Badge variant={provider.isEngaged ? 'secondary' : 'default'} className="gap-1">
                          {provider.isEngaged ? (
                            <>
                              <Clock className="h-3 w-3" />
                              Engaged
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Available
                            </>
                          )}
                        </Badge>
                      </div>
                      {provider.isEngaged && remainingTimeText && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {remainingTimeText}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-2xl font-bold text-primary">
                        KES {Number(provider.rate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {getBusinessTypeLabel(provider.businessType)}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Rating</p>
                <StarRatingDisplay
                  averageRating={avgRating}
                  totalRatings={ratings.length}
                  size="lg"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-sm">{provider.description || 'No description provided'}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.location.address || 'Location not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isUnlocked ? (
            <UnlockDetailsCard
              connectionFee={connectionFee}
              providerName={provider.name}
              onUnlock={() => setUnlockDialogOpen(true)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${provider.phoneNumber}`} className="text-primary hover:underline">
                    {provider.phoneNumber}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Contact via phone for inquiries
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
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
