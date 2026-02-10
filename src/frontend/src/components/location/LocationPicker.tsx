import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MapPin } from 'lucide-react';
import { Location } from '../../backend';

interface LocationPickerProps {
  value: Location;
  onChange: (location: Location) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: value.address || 'Current location',
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Enter your address"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={value.latitude}
            onChange={(e) => onChange({ ...value, latitude: parseFloat(e.target.value) || 0 })}
            placeholder="-1.2921"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={value.longitude}
            onChange={(e) => onChange({ ...value, longitude: parseFloat(e.target.value) || 0 })}
            placeholder="36.8219"
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleUseCurrentLocation}
        className="w-full gap-2"
      >
        <MapPin className="h-4 w-4" />
        Use Current Location
      </Button>
    </div>
  );
}
