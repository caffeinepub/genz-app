import { ProviderProfileView } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { ProviderAvatar } from './ProviderAvatar';
import { StarRatingDisplay } from '../ratings/StarRatingDisplay';
import { getProviderDisplayName } from '../../utils/providerDisplayName';

interface ProviderCardProps {
  provider: ProviderProfileView;
  onClick?: () => void;
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  // Clamp rating to 0-5 range
  const clampedRating = Math.max(0, Math.min(5, avgRating));

  const profilePictureUrl = provider.profilePicture?.blob.getDirectURL();
  const displayName = getProviderDisplayName(provider);

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

  const getEngagementBadge = () => {
    if (provider.isEngaged) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Clock className="h-3 w-3" />
          Engaged
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    );
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-soft"
      onClick={onClick}
    >
      <CardHeader>
        <div className="mb-3 flex justify-center">
          <ProviderAvatar
            name={displayName}
            profilePictureUrl={profilePictureUrl}
            size="md"
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{displayName}</CardTitle>
          <div className="flex flex-col gap-1">
            {getVerificationBadge()}
            {getEngagementBadge()}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {provider.location.address || 'Location available'}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rate</span>
          <span className="text-lg font-semibold text-primary">
            KES {Number(provider.rate).toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Category</span>
          <Badge variant="outline">
            {getBusinessTypeLabel(provider.businessType)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rating</span>
          <StarRatingDisplay
            averageRating={clampedRating}
            totalRatings={ratings.length}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
