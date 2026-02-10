import { ProviderProfileView } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Star, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { ProviderAvatar } from './ProviderAvatar';

interface ProviderCardProps {
  provider: ProviderProfileView;
  onClick?: () => void;
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
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

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-soft"
      onClick={onClick}
    >
      <CardHeader>
        <div className="mb-3 flex justify-center">
          <ProviderAvatar
            name={provider.name}
            profilePictureUrl={profilePictureUrl}
            size="md"
          />
        </div>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          {getVerificationBadge()}
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

        {ratings.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">
                {avgRating.toFixed(1)} ({ratings.length})
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
