import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ProviderProfileView } from '@/backend';
import { StarRatingDisplay } from '../ratings/StarRatingDisplay';
import { WorkSampleGalleryViewer } from './WorkSampleGalleryViewer';
import { MapPin, Clock, CheckCircle, FileText } from 'lucide-react';
import { formatRemainingTime } from '@/utils/engagementTime';
import { getBusinessTypeLabel } from '@/lib/categories';

interface ProviderPreviewDialogProps {
  provider: ProviderProfileView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: () => void;
}

export function ProviderPreviewDialog({
  provider,
  open,
  onOpenChange,
  onViewDetails,
}: ProviderPreviewDialogProps) {
  if (!provider) return null;

  const averageRating = provider.ratings.length > 0
    ? provider.ratings.reduce((sum, r) => sum + Number(r), 0) / provider.ratings.length
    : 0;

  const remainingTimeText = formatRemainingTime(provider.engagementEndTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{provider.displayName}</DialogTitle>
          <DialogDescription>
            {getBusinessTypeLabel(provider.category || provider.businessType)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="flex items-center gap-2">
            <StarRatingDisplay 
              averageRating={averageRating} 
              totalRatings={provider.ratings.length}
            />
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Standard Rate for the service</p>
            <p className="text-xl font-bold text-primary">
              KES {Number(provider.rate).toLocaleString()}
            </p>
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-sm font-medium">About</p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {provider.description || 'No description provided'}
            </p>
          </div>

          {provider.servicesWriteUp && (
            <>
              <Separator />
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                  <FileText className="h-3.5 w-3.5" />
                  Services
                </p>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
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
                variant="compact"
                maxThumbnails={3}
              />
            </>
          )}

          <Separator />

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {provider.location.address}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onViewDetails} className="flex-1">
              View Full Details
            </Button>
            <Button variant="outline" className="flex-1">
              Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
