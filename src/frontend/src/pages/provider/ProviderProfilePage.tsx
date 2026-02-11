import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useGetCallerUserProfile, useUpdateProviderPinnedLocation, useSetEngaged, useDisengage, useUpdateProviderProfile } from '@/hooks/useQueries';
import { BusinessType, Location, ProviderProfileUpdate } from '@/backend';
import { getBusinessTypeLabel, CATEGORIES } from '@/lib/categories';
import { MapPin, Save, Clock, CheckCircle, Edit, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatRemainingTime } from '@/utils/engagementTime';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProviderProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateLocationMutation = useUpdateProviderPinnedLocation();
  const setEngagedMutation = useSetEngaged();
  const disengageMutation = useDisengage();
  const updateProfileMutation = useUpdateProviderProfile();

  const providerProfile = userProfile?.providerProfile;

  const [location, setLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: '',
  });

  const [localIsEngaged, setLocalIsEngaged] = useState(false);
  const [hoursEngaged, setHoursEngaged] = useState<string>('1');

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<{
    rate: string;
    businessType: BusinessType;
    description: string;
    location: Location;
  } | null>(null);

  // Sync local state with backend state
  useEffect(() => {
    if (providerProfile) {
      setLocation(providerProfile.location);
      setLocalIsEngaged(providerProfile.isEngaged);
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
    // Update local state immediately for responsive UI
    setLocalIsEngaged(checked);

    if (checked) {
      // Setting to Engaged - need hours
      const hours = parseInt(hoursEngaged, 10);
      if (isNaN(hours) || hours < 1 || hours > 24) {
        toast.error('Please enter a valid number of hours (1-24)');
        // Revert local state on validation error
        setLocalIsEngaged(false);
        return;
      }

      try {
        await setEngagedMutation.mutateAsync(hours);
        toast.success(`Engagement status set to Engaged for ${hours} hour${hours > 1 ? 's' : ''}`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
        // Revert local state on error
        setLocalIsEngaged(false);
      }
    } else {
      // Setting to Not Engaged
      try {
        await disengageMutation.mutateAsync();
        toast.success('Engagement status set to Not Engaged');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
        // Revert local state on error
        setLocalIsEngaged(true);
      }
    }
  };

  const handleEnterEditMode = () => {
    if (!providerProfile) return;
    
    setEditDraft({
      rate: String(Number(providerProfile.rate)),
      businessType: providerProfile.businessType,
      description: providerProfile.description,
      location: providerProfile.location,
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditDraft(null);
    setEditMode(false);
  };

  const handleSaveChanges = async () => {
    if (!editDraft || !providerProfile) return;

    // Validate rate
    const rateNum = parseFloat(editDraft.rate);
    if (isNaN(rateNum) || rateNum < 0) {
      toast.error('Please enter a valid hourly rate');
      return;
    }

    // Validate location
    if (!editDraft.location.address) {
      toast.error('Please enter a valid address');
      return;
    }

    // Check if anything changed
    const hasChanges = 
      String(Number(providerProfile.rate)) !== editDraft.rate ||
      JSON.stringify(providerProfile.businessType) !== JSON.stringify(editDraft.businessType) ||
      providerProfile.description !== editDraft.description ||
      JSON.stringify(providerProfile.location) !== JSON.stringify(editDraft.location);

    if (!hasChanges) {
      toast.info('No changes to save');
      setEditMode(false);
      return;
    }

    const update: ProviderProfileUpdate = {
      rate: BigInt(Math.round(rateNum)),
      businessType: editDraft.businessType,
      description: editDraft.description,
      location: editDraft.location,
      profilePicture: providerProfile.profilePicture || undefined,
    };

    try {
      await updateProfileMutation.mutateAsync(update);
      toast.success('Profile updated successfully');
      setEditMode(false);
      setEditDraft(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
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
  const isSaving = updateProfileMutation.isPending;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Provider Profile</h1>
        <p className="mt-2 text-muted-foreground">
          {editMode 
            ? 'Edit your service provider profile information'
            : 'View and manage your service provider profile and availability'
          }
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
                {localIsEngaged ? (
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <Label className="text-base font-semibold">
                    {localIsEngaged ? 'Engaged' : 'Not Engaged'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {localIsEngaged
                      ? remainingTimeText || 'Currently working on active jobs'
                      : 'Available for new jobs'}
                  </p>
                </div>
              </div>
              <Switch
                checked={localIsEngaged}
                onCheckedChange={handleEngagementToggle}
                disabled={isUpdatingEngagement}
              />
            </div>

            {!localIsEngaged && (
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {editMode 
                    ? 'Update your service details and location'
                    : 'Your service provider details'
                  }
                </CardDescription>
              </div>
              {!editMode && (
                <Button onClick={handleEnterEditMode} variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Change Info
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio-data section - always read-only */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Bio-data from ID Document</p>
                  <p className="text-xs text-muted-foreground">
                    The following information is taken from your ID document and cannot be changed
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">{providerProfile.name}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <p className="text-sm font-medium">{providerProfile.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            {editMode && editDraft ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-businessType">Service Category</Label>
                  <Select
                    value={JSON.stringify(editDraft.businessType)}
                    onValueChange={(value) => {
                      const businessType = JSON.parse(value) as BusinessType;
                      setEditDraft({ ...editDraft, businessType });
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="edit-businessType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={JSON.stringify(cat.businessType)}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-rate">Hourly Rate (KES)</Label>
                  <Input
                    id="edit-rate"
                    type="number"
                    min="0"
                    step="1"
                    value={editDraft.rate}
                    onChange={(e) => setEditDraft({ ...editDraft, rate: e.target.value })}
                    placeholder="Enter your hourly rate"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                    placeholder="Describe your services and experience"
                    rows={4}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pinned Location
                  </Label>
                  <LocationPicker 
                    value={editDraft.location} 
                    onChange={(loc) => setEditDraft({ ...editDraft, location: loc })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Update Profile'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    variant="outline"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Service Category</Label>
                    <p className="text-sm font-medium">{getBusinessTypeLabel(providerProfile.businessType)}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                    <p className="text-sm font-medium">KES {Number(providerProfile.rate).toLocaleString()}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm whitespace-pre-wrap">{providerProfile.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Pinned Location
                    </Label>
                    <p className="text-sm">{providerProfile.location.address || 'No address provided'}</p>
                    {(providerProfile.location.latitude !== 0 || providerProfile.location.longitude !== 0) && (
                      <p className="text-xs text-muted-foreground">
                        {providerProfile.location.latitude.toFixed(6)}, {providerProfile.location.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    To update your profile information, click the "Change Info" button above. You can modify your service category, hourly rate, description, and location.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
