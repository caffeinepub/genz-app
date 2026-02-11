import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ProviderAvatar } from './ProviderAvatar';
import { StarRatingDisplay } from '../ratings/StarRatingDisplay';
import { MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProviderProfileView } from '../../backend';
import { getBusinessTypeLabel } from '../../lib/categories';
import { ReactNode } from 'react';
import { formatRemainingTime } from '../../utils/engagementTime';

interface ProviderPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderProfileView | null;
  onViewDetails: () => void;
  onViewOnMap: () => void;
  engagementNotice?: ReactNode;
}

export function ProviderPreviewDialog({
  open,
  onOpenChange,
  provider,
  onViewDetails,
  onViewOnMap,
  engagementNotice,
}: ProviderPreviewDialogProps) {
  if (!provider) return null;

  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const profilePictureUrl = provider.profilePicture?.blob.getDirectURL();
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
    return (
      <Badge variant="outline" className="gap-1">
        Unverified
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Preview</DialogTitle>
        </DialogHeader>

        {engagementNotice && (
          <div className="mb-4">
            {engagementNotice}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <ProviderAvatar
              name={provider.name}
              profilePictureUrl={profilePictureUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{provider.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getVerificationBadge()}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between mb-1">
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
                      Available
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {provider.isEngaged && remainingTimeText
                  ? remainingTimeText
                  : provider.isEngaged
                  ? 'Currently working on active jobs'
                  : 'Available for new jobs'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {getBusinessTypeLabel(provider.businessType)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  KES {Number(provider.rate).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Rating</p>
              <StarRatingDisplay
                averageRating={avgRating}
                totalRatings={ratings.length}
                size="sm"
              />
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {provider.location.address || 'Location not specified'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onViewDetails} className="flex-1">
              View Full Details
            </Button>
            <Button onClick={onViewOnMap} variant="outline" className="flex-1">
              View on Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
