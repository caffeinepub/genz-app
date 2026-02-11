import { useState, useEffect, useRef } from 'react';
import { useGetProvider, useRequestLink, useProviderUnlockState, useUnlockProvider, useGetMpesaConfig } from '../../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { UnlockDetailsCard } from '../../components/providers/UnlockDetailsCard';
import { MpesaUnlockDialog } from '../../components/payments/MpesaUnlockDialog';
import { ConversationPanel } from '../../components/messaging/ConversationPanel';
import { ProviderAvatar } from '../../components/providers/ProviderAvatar';
import { EngagementStatusNotice } from '../../components/notifications/EngagementStatusNotice';
import { StarRatingDisplay } from '../../components/ratings/StarRatingDisplay';
import { ArrowLeft, MapPin, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { calculateConnectionFee } from '../../utils/fees';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [mpesaDialogOpen, setMpesaDialogOpen] = useState(false);
  const [showEngagementNotice, setShowEngagementNotice] = useState(false);
  const previousEngagementStatus = useRef<boolean | null>(null);
  
  const principal = Principal.fromText(providerId);
  
  // Enable polling for provider details (3 second interval)
  const { data: provider, isLoading } = useGetProvider(principal, {
    refetchInterval: 3000,
  });
  
  const { data: isUnlocked, isLoading: unlockLoading } = useProviderUnlockState(providerId);
  const { data: mpesaConfig } = useGetMpesaConfig();
  const unlockProvider = useUnlockProvider();
  const requestLink = useRequestLink();

  const connectionFee = provider ? calculateConnectionFee(provider.rate) : 0n;
  const mpesaConfigAvailable = !!mpesaConfig;

  // Detect engagement status changes
  useEffect(() => {
    if (provider) {
      const currentStatus = provider.isEngaged;
      
      // Only show notice if status actually changed (not on initial load)
      if (previousEngagementStatus.current !== null && previousEngagementStatus.current !== currentStatus) {
        setShowEngagementNotice(true);
      }
      
      previousEngagementStatus.current = currentStatus;
    }
  }, [provider]);

  if (isLoading || unlockLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Provider Not Found</h2>
          <Button onClick={() => onNavigate('results')} className="mt-4">
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const profilePictureUrl = provider.profilePicture?.blob.getDirectURL();

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
    return (
      <Badge variant="outline" className="gap-1">
        Unverified
      </Badge>
    );
  };

  const handleUnlock = () => {
    setMpesaDialogOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      await unlockProvider.mutateAsync(providerId);
    } catch (error) {
      console.error('Failed to unlock provider:', error);
    }
  };

  const handleRequestJob = async () => {
    if (!jobDescription.trim()) return;

    try {
      await requestLink.mutateAsync({
        provider: principal,
        payment: connectionFee,
        jobDescription: jobDescription.trim(),
      });
      setJobDescription('');
    } catch (error) {
      console.error('Failed to request job:', error);
    }
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

        {/* Engagement Status Notice */}
        {showEngagementNotice && (
          <div className="mb-6">
            <EngagementStatusNotice
              isEngaged={provider.isEngaged}
              onDismiss={() => setShowEngagementNotice(false)}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-6">
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
                      <CardTitle className="text-2xl">{provider.name}</CardTitle>
                      {getVerificationBadge()}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {provider.location.address || 'Location available after unlock'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Engagement Status */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability Status</span>
                    <Badge variant={provider.isEngaged ? 'secondary' : 'default'} className="gap-1">
                      {provider.isEngaged ? (
                        <>
                          <Clock className="h-3 w-3" />
                          Engaged
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Not Engaged
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {provider.isEngaged
                      ? 'This provider is currently working on active jobs'
                      : 'This provider is available for new jobs'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline" className="mt-1">
                      {getBusinessTypeLabel(provider.businessType)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="mt-1 text-xl font-semibold text-primary">
                      KES {Number(provider.rate).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Star Rating Display */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rating</p>
                  <StarRatingDisplay
                    averageRating={avgRating}
                    totalRatings={ratings.length}
                    size="lg"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">About</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.description || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details - Locked/Unlocked */}
            {!isUnlocked ? (
              <UnlockDetailsCard
                connectionFee={connectionFee}
                providerName={provider.name}
                onUnlock={handleUnlock}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <a
                        href={`tel:${provider.phoneNumber}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {provider.phoneNumber}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Job Request & Messaging */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <Textarea
                    placeholder="Describe the job you need done..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">Connection Fee</p>
                  <p className="text-lg font-semibold text-primary">
                    KES {Number(connectionFee).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    10% of provider rate
                  </p>
                </div>
                <Button
                  onClick={handleRequestJob}
                  disabled={!jobDescription.trim() || requestLink.isPending}
                  className="w-full"
                >
                  {requestLink.isPending ? 'Requesting...' : 'Request Job'}
                </Button>
              </CardContent>
            </Card>

            {isUnlocked && (
              <ConversationPanel
                providerId={providerId}
                providerName={provider.name}
              />
            )}
          </div>
        </div>

        <MpesaUnlockDialog
          open={mpesaDialogOpen}
          onOpenChange={setMpesaDialogOpen}
          connectionFee={connectionFee}
          providerName={provider.name}
          onPaymentSuccess={handlePaymentSuccess}
          mpesaConfigAvailable={mpesaConfigAvailable}
        />
      </div>
    </div>
  );
}
