import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, ExternalLink, Map as MapIcon, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProviderPreview } from '../../backend';
import { getBusinessTypeLabel } from '../../lib/categories';
import { ProviderAvatar } from './ProviderAvatar';
import { StarRatingDisplay } from '../ratings/StarRatingDisplay';
import { ReactNode } from 'react';

interface ProviderPreviewDialogProps {
  preview: ProviderPreview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails: () => void;
  onViewOnMap?: () => void;
  engagementNotice?: ReactNode;
}

export function ProviderPreviewDialog({
  preview,
  open,
  onOpenChange,
  onViewDetails,
  onViewOnMap,
  engagementNotice,
}: ProviderPreviewDialogProps) {
  if (!preview) return null;

  const { provider, isEngaged } = preview;
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

  const googleMapsUrl = `https://www.google.com/maps?q=${provider.location.latitude},${provider.location.longitude}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            <ProviderAvatar
              name={provider.name}
              profilePictureUrl={profilePictureUrl}
              size="lg"
            />
          </div>
          <DialogTitle className="text-2xl">{provider.name}</DialogTitle>
          <DialogDescription>
            Quick preview of this service provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Engagement Status Notice */}
          {engagementNotice && (
            <div>{engagementNotice}</div>
          )}

          {/* Engagement Status */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Availability Status</span>
              <Badge variant={isEngaged ? 'secondary' : 'default'} className="gap-1">
                {isEngaged ? (
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
              {isEngaged
                ? 'This provider is currently working on active jobs'
                : 'This provider is available for new jobs'}
            </p>
          </div>

          {/* Basic Info */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline">{getBusinessTypeLabel(provider.businessType)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-lg font-semibold text-primary">
                KES {Number(provider.rate).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification</span>
              {getVerificationBadge()}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <StarRatingDisplay
                averageRating={avgRating}
                totalRatings={ratings.length}
                size="sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.location.address || 'Address available after unlock'}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Coordinates: {provider.location.latitude.toFixed(4)}, {provider.location.longitude.toFixed(4)}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2"
              asChild
            >
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Open in Google Maps
              </a>
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onViewOnMap && (
              <Button
                variant="outline"
                onClick={onViewOnMap}
                className="flex-1 gap-2"
              >
                <MapIcon className="h-4 w-4" />
                View on Map
              </Button>
            )}
            <Button
              onClick={onViewDetails}
              className="flex-1 gap-2"
            >
              View Full Details
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
