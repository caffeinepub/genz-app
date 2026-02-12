import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import { getGoogleMapsEmbedUrl, getGoogleMapsNavigationUrl, isValidCoordinates } from '../../utils/googleMaps';

interface ProviderLocationMapEmbedProps {
  latitude: number;
  longitude: number;
  address: string;
  providerName: string;
}

/**
 * Displays an embedded Google Map for a provider's location
 * with a link to open in Google Maps
 */
export function ProviderLocationMapEmbed({
  latitude,
  longitude,
  address,
  providerName,
}: ProviderLocationMapEmbedProps) {
  // Validate coordinates before rendering
  if (!isValidCoordinates(latitude, longitude)) {
    return null;
  }

  const embedUrl = getGoogleMapsEmbedUrl(latitude, longitude);
  const navigationUrl = getGoogleMapsNavigationUrl(latitude, longitude, address);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing location of ${providerName}`}
          className="absolute inset-0"
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/30 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{address || 'Provider location'}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="shrink-0 gap-2"
        >
          <a
            href={navigationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
