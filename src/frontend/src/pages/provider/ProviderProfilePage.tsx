import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationPicker } from '@/components/location/LocationPicker';
import { WorkSampleGalleryEditor } from '@/components/providers/WorkSampleGalleryEditor';
import { useGetCallerUserProfile, useSetEngaged, useDisengage, useUpdateProviderProfile, useUpdateProviderIdentityFields } from '@/hooks/useQueries';
import { Location, BusinessType } from '@/backend';
import { Edit, Save, User, MapPin, DollarSign, FileText, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProviderProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateProfileMutation = useUpdateProviderProfile();
  const updateIdentityMutation = useUpdateProviderIdentityFields();
  const setEngagedMutation = useSetEngaged();
  const disengageMutation = useDisengage();

  const providerProfile = userProfile?.providerProfile;

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    surname: '',
    yearOfBirth: '',
    rate: 0,
    businessType: { __kind__: 'cleaning', cleaning: null } as BusinessType,
    location: { latitude: 0, longitude: 0, address: '' } as Location,
    description: '',
    category: { __kind__: 'cleaning', cleaning: null } as BusinessType,
    servicesWriteUp: '',
  });

  const [identityFields, setIdentityFields] = useState({
    middleName: '',
    lastName: '',
    idNumber: '',
    phoneNumber: '',
  });

  const [engagementHours, setEngagementHours] = useState('4');

  useEffect(() => {
    if (providerProfile) {
      setEditedProfile({
        surname: providerProfile.surname,
        yearOfBirth: providerProfile.yearOfBirth,
        rate: Number(providerProfile.rate),
        businessType: providerProfile.businessType,
        location: providerProfile.location,
        description: providerProfile.description,
        category: providerProfile.category || providerProfile.businessType,
        servicesWriteUp: providerProfile.servicesWriteUp || '',
      });
      setIdentityFields({
        middleName: providerProfile.middleName,
        lastName: providerProfile.lastName,
        idNumber: providerProfile.idNumber,
        phoneNumber: providerProfile.phoneNumber,
      });
    }
  }, [providerProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        surname: editedProfile.surname,
        yearOfBirth: editedProfile.yearOfBirth,
        rate: BigInt(editedProfile.rate),
        businessType: editedProfile.businessType,
        location: editedProfile.location,
        profilePicture: providerProfile?.profilePicture,
        description: editedProfile.description,
        category: editedProfile.category,
        servicesWriteUp: editedProfile.servicesWriteUp,
      });
      setIsEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleSaveIdentity = async () => {
    try {
      await updateIdentityMutation.mutateAsync(identityFields);
      toast.success('Identity information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update identity information');
    }
  };

  const handleToggleEngagement = async () => {
    if (!providerProfile) return;

    try {
      if (providerProfile.isEngaged) {
        await disengageMutation.mutateAsync();
        toast.success('You are now available for new clients');
      } else {
        const hours = BigInt(engagementHours);
        await setEngagedMutation.mutateAsync(hours);
        toast.success(`Engagement status set for ${engagementHours} hours`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update engagement status');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!providerProfile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Provider profile not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedCategory = CATEGORIES.find(
    (cat) => JSON.stringify(cat.businessType) === JSON.stringify(editedProfile.category)
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your service provider profile
          </p>
        </div>
        {!isEditMode && (
          <Button onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Engagement Status
            </CardTitle>
            <CardDescription>
              Let clients know if you're currently available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {providerProfile.isEngaged ? 'Currently Engaged' : 'Available'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {providerProfile.isEngaged
                    ? 'You are marked as busy with current work'
                    : 'You are available for new clients'}
                </p>
              </div>
              <Switch
                checked={providerProfile.isEngaged}
                onCheckedChange={handleToggleEngagement}
                disabled={setEngagedMutation.isPending || disengageMutation.isPending}
              />
            </div>
            {!providerProfile.isEngaged && (
              <div className="flex items-center gap-2">
                <Label htmlFor="engagement-hours">Engagement duration (hours):</Label>
                <Input
                  id="engagement-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={engagementHours}
                  onChange={(e) => setEngagementHours(e.target.value)}
                  className="w-24"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {isEditMode ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      value={editedProfile.surname}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, surname: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearOfBirth">Year of Birth</Label>
                    <Input
                      id="yearOfBirth"
                      value={editedProfile.yearOfBirth}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, yearOfBirth: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <Select
                    value={selectedCategory?.id || ''}
                    onValueChange={(categoryId) => {
                      const category = CATEGORIES.find((cat) => cat.id === categoryId);
                      if (category) {
                        setEditedProfile({
                          ...editedProfile,
                          category: category.businessType,
                          businessType: category.businessType,
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={editedProfile.description}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicesWriteUp">Services Offered (Detailed)</Label>
                  <Textarea
                    id="servicesWriteUp"
                    value={editedProfile.servicesWriteUp}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, servicesWriteUp: e.target.value })
                    }
                    rows={5}
                    placeholder="Describe your services in detail..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate (KES)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={editedProfile.rate}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, rate: Number(e.target.value) })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationPicker
                  value={editedProfile.location}
                  onChange={(location) =>
                    setEditedProfile({ ...editedProfile, location })
                  }
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{providerProfile.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Surname</p>
                    <p className="font-medium">{providerProfile.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year of Birth</p>
                    <p className="font-medium">{providerProfile.yearOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {CATEGORIES.find(
                        (cat) =>
                          JSON.stringify(cat.businessType) ===
                          JSON.stringify(providerProfile.category)
                      )?.label || 'Not set'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{providerProfile.description}</p>
                </div>
                {providerProfile.servicesWriteUp && (
                  <div>
                    <p className="text-sm text-muted-foreground">Services Offered</p>
                    <p className="font-medium whitespace-pre-wrap">{providerProfile.servicesWriteUp}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  KES {providerProfile.rate.toString()}/hr
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{providerProfile.location.address}</p>
                <p className="text-sm text-muted-foreground">
                  {providerProfile.location.latitude.toFixed(4)},{' '}
                  {providerProfile.location.longitude.toFixed(4)}
                </p>
              </CardContent>
            </Card>

            <WorkSampleGalleryEditor workSampleImages={providerProfile.workSampleImages} />

            <Card>
              <CardHeader>
                <CardTitle>Identity Information</CardTitle>
                <CardDescription>
                  Update your identity details (required fields)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={identityFields.middleName}
                      onChange={(e) =>
                        setIdentityFields({ ...identityFields, middleName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={identityFields.lastName}
                      onChange={(e) =>
                        setIdentityFields({ ...identityFields, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={identityFields.idNumber}
                      onChange={(e) =>
                        setIdentityFields({ ...identityFields, idNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={identityFields.phoneNumber}
                      onChange={(e) =>
                        setIdentityFields({ ...identityFields, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveIdentity}
                  disabled={updateIdentityMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateIdentityMutation.isPending ? 'Saving...' : 'Save Identity Information'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
