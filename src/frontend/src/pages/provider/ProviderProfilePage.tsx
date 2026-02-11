import { useGetCallerUserProfile, useCreateOrUpdateProviderProfile, useUploadProfilePicture } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { useState, useEffect, useRef, useMemo } from 'react';
import { BusinessType, ExternalBlob } from '../../backend';
import { LocationPicker } from '../../components/location/LocationPicker';
import { ProviderAvatar } from '../../components/providers/ProviderAvatar';
import { Upload, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../../lib/categories';

export function ProviderProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const updateProfile = useCreateOrUpdateProviderProfile();
  const uploadPicture = useUploadProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('electrician');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, address: '' });
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEngaged, setIsEngaged] = useState<boolean>(false);

  // Group categories by type for better UX
  const categorizedOptions = useMemo(() => {
    const technical = CATEGORIES.filter(c => 
      ['electrician', 'plumbing', 'carpentry', 'welding', 'masonry', 'tiling', 'painting', 'hvac', 'solar-installation'].includes(c.id)
    );
    const itRepair = CATEGORIES.filter(c => 
      ['phone-repair', 'computer-repair', 'networking', 'appliance-repair'].includes(c.id)
    );
    const autoTransport = CATEGORIES.filter(c => 
      ['auto-mechanic', 'motorbike-repair', 'auto-electrician', 'driver'].includes(c.id)
    );
    const construction = CATEGORIES.filter(c => 
      ['construction', 'roofing'].includes(c.id)
    );
    const maintenance = CATEGORIES.filter(c => 
      ['handyman', 'gardening'].includes(c.id)
    );
    const domestic = CATEGORIES.filter(c => 
      ['cleaning', 'domestic-work', 'chef', 'hair-beauty'].includes(c.id)
    );
    const other = CATEGORIES.filter(c => 
      ['security', 'tutoring', 'pet-services', 'event-services'].includes(c.id)
    );

    return { technical, itRepair, autoTransport, construction, maintenance, domestic, other };
  }, []);

  useEffect(() => {
    if (userProfile?.providerProfile) {
      const profile = userProfile.providerProfile;
      setName(profile.name);
      setRate(Number(profile.rate).toString());
      setPhoneNumber(profile.phoneNumber);
      setDescription(profile.description);
      setLocation(profile.location);
      setIsEngaged(profile.isEngaged);
      
      if (profile.profilePicture) {
        setProfilePictureUrl(profile.profilePicture.blob.getDirectURL());
      }
      
      // Find matching category by businessType
      const matchingCategory = CATEGORIES.find(cat => {
        const profileType = profile.businessType;
        const catType = cat.businessType;
        return profileType.__kind__ === catType.__kind__;
      });
      
      if (matchingCategory) {
        setSelectedCategoryId(matchingCategory.id);
      }
    }
  }, [userProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const pictureId = `profile_${Date.now()}_${file.name}`;
      await uploadPicture.mutateAsync({ id: pictureId, blob });
      
      setUploadProgress(0);
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !rate || !phoneNumber || !location.address) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);
    if (!selectedCategory) {
      alert('Please select a valid service category');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name,
        rate: BigInt(rate),
        businessType: selectedCategory.businessType,
        location,
        phoneNumber,
        description,
        isEngaged,
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ProviderAvatar
                name={name || 'Provider'}
                profilePictureUrl={profilePictureUrl}
                size="lg"
              />
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadPicture.isPending}
                  className="gap-2"
                >
                  {uploadPicture.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Engagement Status</CardTitle>
            <CardDescription>
              Let clients know if you're currently available for new work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={isEngaged ? 'engaged' : 'not-engaged'}
              onValueChange={(value) => setIsEngaged(value === 'engaged')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="engaged" id="engaged" />
                <Label htmlFor="engaged" className="cursor-pointer font-normal">
                  Engaged
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-engaged" id="not-engaged" />
                <Label htmlFor="not-engaged" className="cursor-pointer font-normal">
                  Not Engaged
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Technical Trades
                    </div>
                    {categorizedOptions.technical.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      IT & Electronics Repair
                    </div>
                    {categorizedOptions.itRepair.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Auto & Transport
                    </div>
                    {categorizedOptions.autoTransport.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Construction
                    </div>
                    {categorizedOptions.construction.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Maintenance & Handyman
                    </div>
                    {categorizedOptions.maintenance.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Domestic & Personal Services
                    </div>
                    {categorizedOptions.domestic.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Other Services
                    </div>
                    {categorizedOptions.other.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
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
