import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useGetCallerUserProfile, useUpdateProviderPinnedLocation, useSetEngaged, useDisengage, useUpdateProviderProfile } from '@/hooks/useQueries';
import { BusinessType, Location, ProviderProfileUpdate } from '@/backend';
import { getBusinessTypeLabel, CATEGORIES } from '@/lib/categories';
import { MapPin, Save, Clock, CheckCircle, Edit, X, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatRemainingTime } from '@/utils/engagementTime';
import { checkProviderProfileCompletion } from '@/utils/profileCompletion';

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
    surname: string;
    yearOfBirth: string;
    rate: string;
    category: string;
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

  const completionStatus = checkProviderProfileCompletion(providerProfile);

  const handleEngagementToggle = async (checked: boolean) => {
    setLocalIsEngaged(checked);

    if (checked) {
      const hours = parseInt(hoursEngaged, 10);
      if (isNaN(hours) || hours < 1 || hours > 24) {
        toast.error('Please enter a valid number of hours (1-24)');
        setLocalIsEngaged(false);
        return;
      }

      try {
        await setEngagedMutation.mutateAsync(BigInt(hours));
        toast.success(`Engagement status set to Engaged for ${hours} hour${hours > 1 ? 's' : ''}`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
        setLocalIsEngaged(false);
      }
    } else {
      try {
        await disengageMutation.mutateAsync();
        toast.success('Engagement status set to Not Engaged');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update engagement status');
        setLocalIsEngaged(true);
      }
    }
  };

  const handleEnterEditMode = () => {
    if (!providerProfile) return;
    
    const matchingCategory = CATEGORIES.find(
      (cat) => JSON.stringify(cat.businessType) === JSON.stringify(providerProfile.category || providerProfile.businessType)
    );
    
    setEditDraft({
      surname: providerProfile.surname || '',
      yearOfBirth: providerProfile.yearOfBirth || '',
      rate: String(Number(providerProfile.rate)),
      category: matchingCategory?.id || '',
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

    if (!editDraft.surname || !editDraft.yearOfBirth) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rateNum = parseFloat(editDraft.rate);
    if (isNaN(rateNum) || rateNum < 0) {
      toast.error('Please enter a valid hourly rate');
      return;
    }

    if (!editDraft.category) {
      toast.error('Please select a service category');
      return;
    }

    if (!editDraft.location.address || editDraft.location.latitude === 0 || editDraft.location.longitude === 0) {
      toast.error('Please enter a valid address and coordinates');
      return;
    }

    const selectedCategory = CATEGORIES.find((cat) => cat.id === editDraft.category);
    if (!selectedCategory) {
      toast.error('Invalid category selected');
      return;
    }

    const update: ProviderProfileUpdate = {
      surname: editDraft.surname,
      yearOfBirth: editDraft.yearOfBirth,
      rate: BigInt(Math.round(rateNum)),
      businessType: selectedCategory.businessType,
      description: editDraft.description,
      location: editDraft.location,
      profilePicture: providerProfile.profilePicture || undefined,
      category: selectedCategory.businessType,
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

  const currentCategory = CATEGORIES.find(
    (cat) => JSON.stringify(cat.businessType) === JSON.stringify(providerProfile.category || providerProfile.businessType)
  );

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
        {!completionStatus.isComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Profile Incomplete:</strong> Please complete the following required fields to access all features: {completionStatus.missingFields.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {completionStatus.isComplete && !editMode && (
          <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile is complete! You can now access all provider features.
            </AlertDescription>
          </Alert>
        )}

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
                <Button onClick={handleEnterEditMode} variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode && editDraft ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Enter surname"
                    value={editDraft.surname}
                    onChange={(e) => setEditDraft({ ...editDraft, surname: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfBirth">Year of Birth *</Label>
                  <Input
                    id="yearOfBirth"
                    type="text"
                    placeholder="e.g., 1990"
                    value={editDraft.yearOfBirth}
                    onChange={(e) => setEditDraft({ ...editDraft, yearOfBirth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate (KES) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter hourly rate"
                    value={editDraft.rate}
                    onChange={(e) => setEditDraft({ ...editDraft, rate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Service Category *</Label>
                  <Select value={editDraft.category} onValueChange={(value) => setEditDraft({ ...editDraft, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your services"
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exact Location *</Label>
                  <LocationPicker
                    value={editDraft.location}
                    onChange={(loc) => setEditDraft({ ...editDraft, location: loc })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide your exact address and coordinates
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveChanges} disabled={isSaving} className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">{providerProfile.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Surname</p>
                    <p className="text-base">{providerProfile.surname || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year of Birth</p>
                    <p className="text-base">{providerProfile.yearOfBirth || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-base">{providerProfile.phoneNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                    <p className="text-base">KES {Number(providerProfile.rate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-base">{currentCategory?.label || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base">{providerProfile.description || 'No description provided'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base">{providerProfile.location.address || 'Not set'}</p>
                  <p className="text-xs text-muted-foreground">
                    {providerProfile.location.latitude}, {providerProfile.location.longitude}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
