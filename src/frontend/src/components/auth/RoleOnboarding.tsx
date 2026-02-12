import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSaveCallerUserProfile } from '@/hooks/useQueries';
import { UserRole, BusinessType } from '@/backend';
import { CATEGORIES } from '@/lib/categories';
import { Briefcase, Users, Shield, AlertCircle } from 'lucide-react';

interface RoleOnboardingProps {
  onComplete: () => void;
}

export function RoleOnboarding({ onComplete }: RoleOnboardingProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const saveProfileMutation = useSaveCallerUserProfile();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (selectedRole === UserRole.provider && !selectedCategory) {
      setError('Please select a service category');
      return;
    }

    try {
      const category = CATEGORIES.find((cat) => cat.id === selectedCategory);
      const businessType: BusinessType = category?.businessType || { __kind__: 'cleaning', cleaning: null };

      if (selectedRole === UserRole.client) {
        await saveProfileMutation.mutateAsync({
          role: UserRole.client,
          clientProfile: {
            surname: 'UNKNOWN',
            middleName: 'UNKNOWN',
            lastName: 'UNKNOWN',
            yearOfBirth: 'UNKNOWN',
            idNumber: '0',
            mobileNumber: 'UNKNOWN',
            phoneNumber: 'UNKNOWN',
            pinnedLocation: {
              latitude: 0,
              longitude: 0,
              address: '',
            },
          },
          providerProfile: undefined,
        });
      } else if (selectedRole === UserRole.provider) {
        await saveProfileMutation.mutateAsync({
          role: UserRole.provider,
          providerProfile: {
            id: '',
            surname: 'UNKNOWN',
            middleName: 'UNKNOWN',
            lastName: 'UNKNOWN',
            yearOfBirth: 'UNKNOWN',
            idNumber: '0',
            name: 'UNKNOWN',
            rate: undefined,
            businessType,
            location: {
              latitude: 0,
              longitude: 0,
              address: '',
            },
            verificationStatus: { __kind__: 'unverified', unverified: null },
            ratings: [],
            profilePicture: undefined,
            phoneNumber: 'UNKNOWN',
            description: '',
            academicDocuments: [],
            goodConductCert: undefined,
            isEngaged: false,
            engagementEndTime: undefined,
            category: businessType,
          },
          clientProfile: undefined,
        });
      } else if (selectedRole === UserRole.backOffice) {
        await saveProfileMutation.mutateAsync({
          role: UserRole.backOffice,
          clientProfile: undefined,
          providerProfile: undefined,
        });
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Role</CardTitle>
          <CardDescription>
            Choose how you want to use Genz App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <Button
              variant={selectedRole === UserRole.client ? 'default' : 'outline'}
              onClick={() => handleRoleSelect(UserRole.client)}
              className="h-auto flex-col gap-2 p-6"
            >
              <Users className="h-8 w-8" />
              <div>
                <div className="font-semibold">Client</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Find and hire service providers
                </div>
              </div>
            </Button>

            <Button
              variant={selectedRole === UserRole.provider ? 'default' : 'outline'}
              onClick={() => handleRoleSelect(UserRole.provider)}
              className="h-auto flex-col gap-2 p-6"
            >
              <Briefcase className="h-8 w-8" />
              <div>
                <div className="font-semibold">Service Provider</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Offer your services to clients
                </div>
              </div>
            </Button>

            <Button
              variant={selectedRole === UserRole.backOffice ? 'default' : 'outline'}
              onClick={() => handleRoleSelect(UserRole.backOffice)}
              className="h-auto flex-col gap-2 p-6"
            >
              <Shield className="h-8 w-8" />
              <div>
                <div className="font-semibold">Technical Team</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Manage platform operations
                </div>
              </div>
            </Button>
          </div>

          {selectedRole === UserRole.provider && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Category *</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your service category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the category that best describes your services
              </p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || saveProfileMutation.isPending || (selectedRole === UserRole.provider && !selectedCategory)}
            className="w-full"
            size="lg"
          >
            {saveProfileMutation.isPending ? 'Creating Profile...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
