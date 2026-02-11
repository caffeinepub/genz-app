import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useGetCallerUserProfile, useUpdateProviderPinnedLocation, useSetEngaged, useDisengage } from '@/hooks/useQueries';
import { BusinessType, Location } from '@/backend';
import { getBusinessTypeLabel } from '@/lib/categories';
import { MapPin, Save, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatRemainingTime } from '@/utils/engagementTime';

export function ProviderProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateLocationMutation = useUpdateProviderPinnedLocation();
  const setEngagedMutation = useSetEngaged();
  const disengageMutation = useDisengage();

  const providerProfile = userProfile?.providerProfile;

  const [location, setLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: '',
  });

  const [isEngaged, setIsEngaged] = useState(false);
  const [hoursEngaged, setHoursEngaged] = useState<string>('1');

  useEffect(() => {
    if (providerProfile) {
      setLocation(providerProfile.location);
      setIsEngaged(providerProfile.isEngaged);
    }
  }, [providerProfile]);

  const handleUpdateLocation = async () => {
    if (!location.address) {
      toast.error('Please enter an address');
      return;
    }

    try {
      await updateLocationMutation.mutateAsync(location);
      toast.success('Pinned location updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update location');
    }
  };

  const handleEngagementToggle = async (checked: boolean) => {
    if (checked) {
      // Setting to Engaged - need hours
      const hours = parseInt(hoursEngaged, 10);
      if (isNaN(hours) || hours < 1 || hours > 24) {
        toast.error('Please enter a valid number of hours (1-24)');
        return;
      }

      try {
        await setEngagedMutation.mutateAsync(hours);
        toast.success(`Engagement status set to Engaged for ${hours} hour${hours > 1 ? 's' : ''}`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
      }
    } else {
      // Setting to Not Engaged
      try {
        await disengageMutation.mutateAsync();
        toast.success('Engagement status set to Not Engaged');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
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

  if (!providerProfile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>No Provider Profile</CardTitle>
            <CardDescription>
              You need to create a provider profile first.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const remainingTimeText = formatRemainingTime(providerProfile.engagementEndTime);
  const isUpdatingEngagement = setEngagedMutation.isPending || disengageMutation.isPending;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Provider Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your service provider profile and availability
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Status</CardTitle>
            <CardDescription>
              Control your availability for new jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                {providerProfile.isEngaged ? (
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <Label className="text-base font-semibold">
                    {providerProfile.isEngaged ? 'Engaged' : 'Not Engaged'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {providerProfile.isEngaged
                      ? remainingTimeText || 'Currently working on active jobs'
                      : 'Available for new jobs'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isEngaged}
                onCheckedChange={handleEngagementToggle}
                disabled={isUpdatingEngagement}
              />
            </div>

            {!providerProfile.isEngaged && (
              <div className="space-y-2">
                <Label htmlFor="hoursEngaged">Hours to be engaged</Label>
                <Input
                  id="hoursEngaged"
                  type="number"
                  min="1"
                  max="24"
                  value={hoursEngaged}
                  onChange={(e) => setHoursEngaged(e.target.value)}
                  placeholder="Enter hours (1-24)"
                  disabled={isUpdatingEngagement}
                />
                <p className="text-xs text-muted-foreground">
                  When you set your status to Engaged, clients will see how long you'll be unavailable
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pinned Location
            </CardTitle>
            <CardDescription>
              Update your pinned location for efficient client matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationPicker value={location} onChange={setLocation} />

            <Button
              type="button"
              onClick={handleUpdateLocation}
              disabled={updateLocationMutation.isPending}
              variant="outline"
              className="w-full gap-2"
            >
              <Save className="h-5 w-5" />
              {updateLocationMutation.isPending ? 'Updating...' : 'Update Location'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={providerProfile.name}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="businessType">Service Category</Label>
              <Input
                id="businessType"
                value={getBusinessTypeLabel(providerProfile.businessType)}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="rate">Hourly Rate (KES)</Label>
              <Input
                id="rate"
                type="number"
                value={Number(providerProfile.rate)}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={providerProfile.phoneNumber}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={providerProfile.description}
                disabled
                rows={4}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Note: Profile editing will be available in a future update. Currently you can only update your pinned location and engagement status.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
