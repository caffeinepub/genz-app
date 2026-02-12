import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetProvider } from '@/hooks/useQueries';
import { StarRatingDisplay } from '@/components/ratings/StarRatingDisplay';
import { WorkSampleGalleryViewer } from '@/components/providers/WorkSampleGalleryViewer';
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, FileText, Info } from 'lucide-react';
import { formatRemainingTime } from '@/utils/engagementTime';
import { getBusinessTypeLabel } from '@/lib/categories';
import { ProviderLocationMapEmbed } from '@/components/location/ProviderLocationMapEmbed';
import { isValidCoordinates } from '@/utils/googleMaps';
import { Principal } from '@icp-sdk/core/principal';
import { MpesaUnlockDialog } from '@/components/payments/MpesaUnlockDialog';
import { calculateConnectionFee, formatKES } from '@/utils/fees';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const providerPrincipal = Principal.fromText(providerId);
  const { data: provider, isLoading, error, refetch } = useGetProvider(providerPrincipal);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // Poll every 3 seconds for live engagement updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>
              The provider you are looking for could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const averageRating = provider.ratings.length > 0
    ? provider.ratings.reduce((sum, r) => sum + Number(r), 0) / provider.ratings.length
    : 0;

  const remainingTimeText = formatRemainingTime(provider.engagementEndTime);

  const hasValidLocation = isValidCoordinates(provider.location.latitude, provider.location.longitude);

  const connectionFee = calculateConnectionFee(provider.rate);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{provider.displayName}</CardTitle>
                <CardDescription className="mt-2">
                  {getBusinessTypeLabel(provider.category || provider.businessType)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {provider.verificationStatus.__kind__ === 'verified' && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {provider.isEngaged ? (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Engaged{remainingTimeText ? ` (${remainingTimeText})` : ''}
                  </Badge>
                ) : (
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Available
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <StarRatingDisplay 
                averageRating={averageRating} 
                totalRatings={provider.ratings.length}
              />
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-semibold">Standard Rate for the service</h3>
              <p className="text-2xl font-bold text-primary">
                KES {Number(provider.rate).toLocaleString()}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {provider.description || 'No description provided'}
              </p>
            </div>

            {provider.servicesWriteUp && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4" />
                    Services Offered
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {provider.servicesWriteUp}
                  </p>
                </div>
              </>
            )}

            {provider.workSampleImages.length > 0 && (
              <>
                <Separator />
                <WorkSampleGalleryViewer 
                  workSampleImages={provider.workSampleImages}
                  variant="full"
                />
              </>
            )}

            <Separator />

            <div>
              <h3 className="mb-3 font-semibold">Location</h3>
              {hasValidLocation ? (
                <ProviderLocationMapEmbed 
                  latitude={provider.location.latitude}
                  longitude={provider.location.longitude}
                  address={provider.location.address}
                  providerName={provider.displayName}
                />
              ) : (
                <div className="flex items-start gap-2 rounded-lg border p-4">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p>{provider.location.address || 'Address not available'}</p>
                    {provider.location.latitude !== 0 && provider.location.longitude !== 0 && (
                      <p className="text-muted-foreground">
                        {provider.location.latitude.toFixed(4)}, {provider.location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Connection Fee:</strong> A 10% connection fee ({formatKES(connectionFee)}) will be charged to unlock this provider's contact details.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button 
                className="flex-1 gap-2"
                onClick={() => setShowUnlockDialog(true)}
              >
                <Phone className="h-4 w-4" />
                Contact Service Provider
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Mail className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MpesaUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        providerId={providerId}
        amount={connectionFee}
      />
    </div>
  );
}
