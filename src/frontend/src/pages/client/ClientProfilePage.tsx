import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationPicker } from '@/components/location/LocationPicker';
import { useGetCallerUserProfile, useUpdateClientProfile, useSaveClientBioData } from '@/hooks/useQueries';
import { Location, BioData } from '@/backend';
import { Save, User, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { checkClientProfileCompletion } from '@/utils/profileCompletion';

export function ClientProfilePage() {
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const updateClientProfileMutation = useUpdateClientProfile();
  const saveBioDataMutation = useSaveClientBioData();

  const clientProfile = userProfile?.clientProfile;
  
  const [requiredFields, setRequiredFields] = useState({
    surname: '',
    middleName: '',
    lastName: '',
    yearOfBirth: '',
    idNumber: '',
    mobileNumber: '',
    phoneNumber: '',
  });

  const [location, setLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: '',
  });

  const [bioData, setBioData] = useState<BioData>({
    fullName: '',
    email: '',
    address: '',
    nationalId: '',
  });

  useEffect(() => {
    if (clientProfile) {
      setRequiredFields({
        surname: clientProfile.surname || '',
        middleName: clientProfile.middleName || '',
        lastName: clientProfile.lastName || '',
        yearOfBirth: clientProfile.yearOfBirth || '',
        idNumber: clientProfile.idNumber || '',
        mobileNumber: clientProfile.mobileNumber || '',
        phoneNumber: clientProfile.phoneNumber || '',
      });
      setLocation(clientProfile.pinnedLocation || { latitude: 0, longitude: 0, address: '' });
      if (clientProfile.bioData) {
        setBioData(clientProfile.bioData);
      }
    }
  }, [clientProfile]);

  const completionStatus = checkClientProfileCompletion(clientProfile);

  const handleSaveRequiredFields = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!requiredFields.surname || !requiredFields.middleName || !requiredFields.lastName) {
      toast.error('Please fill in all name fields');
      return;
    }
    if (!requiredFields.yearOfBirth) {
      toast.error('Please enter your year of birth');
      return;
    }
    if (!requiredFields.idNumber) {
      toast.error('Please enter your ID number');
      return;
    }
    if (!requiredFields.mobileNumber) {
      toast.error('Please enter your mobile number');
      return;
    }
    if (!requiredFields.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!location.address || location.latitude === 0 || location.longitude === 0) {
      toast.error('Please set your exact location with valid coordinates and address');
      return;
    }

    try {
      await updateClientProfileMutation.mutateAsync({
        surname: requiredFields.surname,
        middleName: requiredFields.middleName,
        lastName: requiredFields.lastName,
        yearOfBirth: requiredFields.yearOfBirth,
        idNumber: requiredFields.idNumber,
        mobileNumber: requiredFields.mobileNumber,
        phoneNumber: requiredFields.phoneNumber,
        pinnedLocation: location,
      });
      toast.success('Profile information saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile information');
    }
  };

  const handleSaveBioData = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!bioData.fullName || !bioData.email) {
      toast.error('Please fill in all required fields (Full Name and Email)');
      return;
    }

    try {
      await saveBioDataMutation.mutateAsync(bioData);
      toast.success('Bio data saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bio data');
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
          Manage your client profile and personal information
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

        {completionStatus.isComplete && (
          <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile is complete! You can now access all client features.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Required Information
            </CardTitle>
            <CardDescription>
              Complete these fields to access all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="surname">Surname *</Label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Enter surname"
                  value={requiredFields.surname}
                  onChange={(e) => setRequiredFields({ ...requiredFields, surname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name *</Label>
                <Input
                  id="middleName"
                  type="text"
                  placeholder="Enter middle name"
                  value={requiredFields.middleName}
                  onChange={(e) => setRequiredFields({ ...requiredFields, middleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={requiredFields.lastName}
                  onChange={(e) => setRequiredFields({ ...requiredFields, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfBirth">Year of Birth *</Label>
              <Input
                id="yearOfBirth"
                type="text"
                placeholder="e.g., 1990"
                value={requiredFields.yearOfBirth}
                onChange={(e) => setRequiredFields({ ...requiredFields, yearOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder="Enter your ID number"
                value={requiredFields.idNumber}
                onChange={(e) => setRequiredFields({ ...requiredFields, idNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="+254 712 345 678"
                value={requiredFields.mobileNumber}
                onChange={(e) => setRequiredFields({ ...requiredFields, mobileNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+254 723 456 789"
                value={requiredFields.phoneNumber}
                onChange={(e) => setRequiredFields({ ...requiredFields, phoneNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Exact Location *</Label>
              <LocationPicker value={location} onChange={setLocation} />
              <p className="text-xs text-muted-foreground">
                Provide your exact address and coordinates for service provider matching
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSaveRequiredFields}
              disabled={updateClientProfileMutation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-5 w-5" />
              {updateClientProfileMutation.isPending ? 'Saving...' : 'Save Required Information'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Bio Data (Optional)
            </CardTitle>
            <CardDescription>
              Additional personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={bioData.fullName}
                onChange={(e) => setBioData({ ...bioData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={bioData.email}
                onChange={(e) => setBioData({ ...bioData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your physical address"
                value={bioData.address}
                onChange={(e) => setBioData({ ...bioData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID Number</Label>
              <Input
                id="nationalId"
                type="text"
                placeholder="Enter your national ID number"
                value={bioData.nationalId}
                onChange={(e) => setBioData({ ...bioData, nationalId: e.target.value })}
              />
            </div>

            <Button
              type="button"
              onClick={handleSaveBioData}
              disabled={saveBioDataMutation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-5 w-5" />
              {saveBioDataMutation.isPending ? 'Saving...' : 'Save Bio Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
