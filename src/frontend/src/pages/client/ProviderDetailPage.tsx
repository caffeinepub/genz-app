import { useGetProvider, useRequestLink } from '../../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, MapPin, Star, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getBusinessTypeLabel } from '../../lib/categories';
import { useState } from 'react';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const [jobDescription, setJobDescription] = useState('');
  const principal = Principal.fromText(providerId);
  const { data: provider, isLoading } = useGetProvider(principal);
  const requestLink = useRequestLink();

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Provider Not Found</h2>
          <Button onClick={() => onNavigate('results')} className="mt-4">
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const ratings = provider.ratings.map((r) => Number(r));
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const getVerificationBadge = () => {
    if ('verified' in provider.verificationStatus) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    if ('pending' in provider.verificationStatus) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending Verification
        </Badge>
      );
    }
    if ('rejected' in provider.verificationStatus) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Verification Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        Not Verified
      </Badge>
    );
  };

  const handleHire = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description');
      return;
    }
    
    try {
      await requestLink.mutateAsync({
        provider: principal,
        payment: provider.rate,
        jobDescription: jobDescription.trim(),
      });
      onNavigate('my-jobs');
    } catch (error) {
      console.error('Failed to create job request:', error);
      alert('Failed to create job request. Please try again.');
    }
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('results')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{provider.name}</CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {provider.location.address || 'Location available'}
                    </div>
                  </div>
                  {getVerificationBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {provider.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline" className="mt-1">
                      {getBusinessTypeLabel(provider.businessType)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Phone className="h-3.5 w-3.5" />
                      {provider.phoneNumber || 'Not provided'}
                    </div>
                  </div>

                  {ratings.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">
                          {avgRating.toFixed(1)} ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Hire This Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    KES {Number(provider.rate).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <Textarea
                    placeholder="Describe what you need done..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleHire}
                  disabled={requestLink.isPending || !jobDescription.trim()}
                  className="w-full"
                >
                  {requestLink.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating Request...
                    </>
                  ) : (
                    'Request Service'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
