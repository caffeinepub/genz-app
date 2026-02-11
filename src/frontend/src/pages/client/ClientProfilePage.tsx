import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useGetCallerUserProfile, useUpdateClientPinnedLocation } from '@/hooks/useQueries';
import { Location } from '@/backend';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ClientProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateLocationMutation = useUpdateClientPinnedLocation();

  const clientProfile = userProfile?.clientProfile;
  const [location, setLocation] = useState<Location>(
    clientProfile?.pinnedLocation || {
      latitude: 0,
      longitude: 0,
      address: '',
    }
  );

  const handleUpdateLocation = async () => {
    if (!location.address) {
      toast.error('Please enter an address');
      return;
    }

    try {
      await updateLocationMutation.mutateAsync(location);
      toast.success('Pinned location updated successfully');
    } catch (error: any) {
      if (error.message?.includes('not a client') || error.message?.includes('Unauthorized')) {
        toast.error('You must be a client to update your location');
      } else {
        toast.error(error.message || 'Failed to update location');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your client profile and pinned location
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pinned Location
            </CardTitle>
            <CardDescription>
              Update your pinned location for efficient service provider matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationPicker value={location} onChange={setLocation} />

            <Button
              onClick={handleUpdateLocation}
              disabled={updateLocationMutation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-5 w-5" />
              {updateLocationMutation.isPending ? 'Updating...' : 'Update Location'}
            </Button>
          </CardContent>
        </Card>

        {clientProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-base">{clientProfile.phoneNumber || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                <p className="text-base">
                  {clientProfile.isVerified ? (
                    <span className="text-green-600">Verified ✓</span>
                  ) : (
                    <span className="text-yellow-600">Not verified</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
