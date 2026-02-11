import { useState, useEffect } from 'react';
import { UserRole, BusinessType } from '../../backend';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Users, Briefcase, Shield, AlertCircle } from 'lucide-react';
import { getPendingRole, clearPendingRole } from '../../utils/pendingRoleSelection';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { CATEGORIES } from '../../lib/categories';
import { Alert, AlertDescription } from '../ui/alert';

export function RoleOnboarding() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  // Check for pending role selection on mount
  useEffect(() => {
    const pendingRole = getPendingRole();
    if (pendingRole) {
      setSelectedRole(pendingRole);
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedRole || !actor || !identity) return;
    
    // Validate provider category selection
    if (selectedRole === UserRole.provider && !selectedCategory) {
      setValidationError('Please select a service category to continue');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    try {
      // Create a minimal profile based on role
      if (selectedRole === UserRole.client) {
        await actor.saveCallerUserProfile({
          role: selectedRole,
          clientProfile: {
            phoneNumber: '',
            pinnedLocation: undefined,
          },
          providerProfile: undefined,
        });
      } else if (selectedRole === UserRole.provider) {
        const category = CATEGORIES.find((cat) => cat.id === selectedCategory);
        if (!category) {
          setValidationError('Invalid category selected');
          setIsSubmitting(false);
          return;
        }

        await actor.saveCallerUserProfile({
          role: selectedRole,
          providerProfile: {
            name: '',
            businessType: category.businessType,
            location: { latitude: 0, longitude: 0, address: '' },
            ratings: [],
            description: '',
            academicDocuments: [],
            phoneNumber: '',
            profilePicture: undefined,
            goodConductCert: undefined,
            verificationStatus: { __kind__: 'unverified', unverified: null },
            isEngaged: false,
            engagementEndTime: undefined,
            category: category.businessType,
          },
          clientProfile: undefined,
        });
      } else if (selectedRole === UserRole.backOffice) {
        await actor.saveCallerUserProfile({
          role: selectedRole,
          clientProfile: undefined,
          providerProfile: undefined,
        });
      }
      
      clearPendingRole();
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    } catch (error) {
      console.error('Error setting user role:', error);
      setValidationError('Failed to set role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      value: UserRole.client,
      icon: Users,
      title: 'Client',
      description: 'I need services from professionals',
    },
    {
      value: UserRole.provider,
      icon: Briefcase,
      title: 'Service Provider',
      description: 'I offer professional services',
    },
    {
      value: UserRole.backOffice,
      icon: Shield,
      title: 'Technical Team',
      description: 'I verify service providers',
    },
  ];

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Genz App</h1>
          <p className="mt-2 text-muted-foreground">
            Please select your role to get started
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            return (
              <Card
                key={role.value}
                className={`cursor-pointer transition-all hover:shadow-soft ${
                  isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => {
                  setSelectedRole(role.value);
                  setValidationError('');
                  if (role.value !== UserRole.provider) {
                    setSelectedCategory('');
                  }
                }}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="text-xs">{role.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {selectedRole === UserRole.provider && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Your Service Category</CardTitle>
              <CardDescription>Choose the category that best describes your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-select">Service Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You will only appear in this category when clients search for services
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {validationError && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Setting up...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
