import { useGetCallerUserProfile, useCreateOrUpdateProviderProfile } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useState, useEffect } from 'react';
import { BusinessType } from '../../backend';
import { LocationPicker } from '../../components/location/LocationPicker';

export function ProviderProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateProfile = useCreateOrUpdateProviderProfile();

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [businessType, setBusinessType] = useState<string>('cleaning');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, address: '' });

  useEffect(() => {
    if (userProfile?.providerProfile) {
      const profile = userProfile.providerProfile;
      setName(profile.name);
      setRate(Number(profile.rate).toString());
      setPhoneNumber(profile.phoneNumber);
      setDescription(profile.description);
      setLocation(profile.location);
      
      if ('cleaning' in profile.businessType) setBusinessType('cleaning');
      else if ('catering' in profile.businessType) setBusinessType('catering');
      else if ('maintenance' in profile.businessType) setBusinessType('maintenance');
      else if ('wellness' in profile.businessType) setBusinessType('wellness');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !rate || !phoneNumber || !location.address) {
      alert('Please fill in all required fields');
      return;
    }

    const businessTypeObj: BusinessType = 
      businessType === 'cleaning' ? { __kind__: 'cleaning', cleaning: null } :
      businessType === 'catering' ? { __kind__: 'catering', catering: null } :
      businessType === 'wellness' ? { __kind__: 'wellness', wellness: null } :
      { __kind__: 'maintenance', maintenance: null };

    try {
      await updateProfile.mutateAsync({
        name,
        rate: BigInt(rate),
        businessType: businessTypeObj,
        location,
        phoneNumber,
        description,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Provider Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Update your information to attract more clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your professional name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType">Service Category *</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="catering">Catering / Chef</SelectItem>
                    <SelectItem value="maintenance">Maintenance (Plumbing, Electrical, Gardening)</SelectItem>
                    <SelectItem value="wellness">Wellness (Dog Grooming, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rate">Rate (KES) *</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Your service rate"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254 700 000 000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell clients about your services and experience"
                  rows={4}
                />
              </div>

              <LocationPicker value={location} onChange={setLocation} />

              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="w-full"
              >
                {updateProfile.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
