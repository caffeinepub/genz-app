import { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useRemoveAllProviders, useSeedProviders } from '../../hooks/useQueries';
import { ProviderProfileView, BusinessType } from '../../backend';
import { CATEGORIES } from '../../lib/categories';
import { Loader2, Trash2, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProviderDatasetToolsPanelProps {
  isAdmin: boolean;
}

export function ProviderDatasetToolsPanel({ isAdmin }: ProviderDatasetToolsPanelProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const removeAllProviders = useRemoveAllProviders();
  const seedProviders = useSeedProviders();

  const handleRemoveAll = async () => {
    setFeedback(null);
    try {
      await removeAllProviders.mutateAsync();
      setFeedback({
        type: 'success',
        message: 'All service providers have been successfully removed from the platform.',
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to remove providers. Please try again.',
      });
    }
  };

  const handleSeedProviders = async () => {
    setFeedback(null);
    try {
      const seedData = generateSeedData();
      await seedProviders.mutateAsync(seedData);
      setFeedback({
        type: 'success',
        message: `Successfully seeded ${seedData.length} service providers across different categories.`,
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to seed providers. Please try again.',
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Team Tools</CardTitle>
          <CardDescription>Provider dataset management</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to perform these actions. Only administrators can manage the provider dataset.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Team Tools</CardTitle>
        <CardDescription>Manage the service provider dataset for testing and development</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex-1">
              <h3 className="font-semibold">Delete All Providers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Remove all service provider profiles from the platform. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={removeAllProviders.isPending}
                  className="shrink-0"
                >
                  {removeAllProviders.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all service provider profiles from the platform. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete all providers
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex-1">
              <h3 className="font-semibold">Seed Category Providers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create sample service providers distributed across different service categories for testing.
              </p>
            </div>
            <Button
              onClick={handleSeedProviders}
              disabled={seedProviders.isPending}
              className="shrink-0"
            >
              {seedProviders.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Providers
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate realistic seed data for providers across categories
function generateSeedData(): Array<[Principal, ProviderProfileView]> {
  const providers: Array<[Principal, ProviderProfileView]> = [];
  
  const sampleNames = [
    'John Kamau', 'Mary Wanjiku', 'David Omondi', 'Grace Akinyi',
    'Peter Mwangi', 'Jane Njeri', 'Samuel Otieno', 'Lucy Wambui',
    'Michael Kipchoge', 'Sarah Chebet', 'James Mutua', 'Faith Nyambura',
    'Daniel Kiprono', 'Rose Wangari', 'Joseph Ochieng', 'Anne Muthoni',
    'Patrick Kimani', 'Catherine Auma', 'Francis Korir', 'Elizabeth Wairimu'
  ];

  const locations = [
    { latitude: -1.2921, longitude: 36.8219, address: 'Nairobi CBD, Nairobi' },
    { latitude: -1.2864, longitude: 36.8172, address: 'Westlands, Nairobi' },
    { latitude: -1.3032, longitude: 36.7073, address: 'Karen, Nairobi' },
    { latitude: -1.2195, longitude: 36.8906, address: 'Kasarani, Nairobi' },
    { latitude: -1.3644, longitude: 36.8906, address: 'Embakasi, Nairobi' },
    { latitude: -0.0917, longitude: 34.7680, address: 'Kisumu City' },
    { latitude: -4.0435, longitude: 39.6682, address: 'Mombasa' },
    { latitude: -0.2827, longitude: 36.0800, address: 'Nakuru' },
  ];

  const descriptions = [
    'Experienced professional with over 5 years in the industry. Committed to quality work and customer satisfaction.',
    'Certified specialist providing reliable and affordable services. Available for both residential and commercial projects.',
    'Skilled technician with excellent track record. Fast response time and competitive rates.',
    'Professional service provider dedicated to excellence. Licensed and insured for your peace of mind.',
    'Expert in the field with modern tools and techniques. Offering same-day service for urgent needs.',
  ];

  // Distribute providers across categories
  const categoriesWithProviders = CATEGORIES.slice(0, 15); // Use first 15 categories
  
  categoriesWithProviders.forEach((category, categoryIndex) => {
    // Create 2-3 providers per category
    const providersPerCategory = 2 + (categoryIndex % 2);
    
    for (let i = 0; i < providersPerCategory; i++) {
      const nameIndex = (categoryIndex * 3 + i) % sampleNames.length;
      const locationIndex = (categoryIndex * 2 + i) % locations.length;
      const descIndex = (categoryIndex + i) % descriptions.length;
      
      // Generate a unique principal for each provider
      const principalBytes = new Uint8Array(29);
      principalBytes[0] = categoryIndex;
      principalBytes[1] = i;
      for (let j = 2; j < 29; j++) {
        principalBytes[j] = Math.floor(Math.random() * 256);
      }
      const principal = Principal.fromUint8Array(principalBytes);
      
      const isEngaged = Math.random() > 0.7; // 30% chance of being engaged
      const engagementEndTime = isEngaged 
        ? BigInt(Date.now() * 1_000_000 + (2 + Math.floor(Math.random() * 6)) * 3600 * 1_000_000_000)
        : undefined;
      
      const provider: ProviderProfileView = {
        principal,
        name: sampleNames[nameIndex],
        rate: BigInt(500 + Math.floor(Math.random() * 2000)),
        businessType: category.businessType,
        location: locations[locationIndex],
        verificationStatus: { __kind__: 'verified', verified: null },
        ratings: [4, 5, 5, 4, 5].map(r => BigInt(r)),
        profilePicture: undefined,
        phoneNumber: `+254${700000000 + Math.floor(Math.random() * 99999999)}`,
        description: descriptions[descIndex],
        academicDocuments: [],
        goodConductCert: undefined,
        isEngaged,
        engagementEndTime,
        category: category.businessType,
      };
      
      providers.push([principal, provider]);
    }
  });

  return providers;
}
