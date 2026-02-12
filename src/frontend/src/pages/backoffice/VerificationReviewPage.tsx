import { useState } from 'react';
import { useGetCallerUserProfile, useIsCallerAdmin, useGetProvidersForReview, useGetProvider, useVerifyProvider } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { ProviderDatasetToolsPanel } from './ProviderDatasetToolsPanel';
import { CheckCircle, AlertCircle, Loader2, User, MapPin, Phone, FileText, Clock, XCircle } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';
import { ProviderProfileView } from '../../backend';

export function VerificationReviewPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: providersForReview, isLoading: providersLoading } = useGetProvidersForReview();
  const [selectedProvider, setSelectedProvider] = useState<Principal | null>(null);
  const { data: selectedProviderData, isLoading: providerDetailLoading } = useGetProvider(
    selectedProvider ?? Principal.anonymous()
  );
  const verifyProvider = useVerifyProvider();

  const isLoading = profileLoading || adminLoading;

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access this page. Only Administrators can review and verify service providers.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleVerify = async (providerPrincipal: Principal) => {
    try {
      await verifyProvider.mutateAsync(providerPrincipal);
      setSelectedProvider(null);
    } catch (error: any) {
      console.error('Verification error:', error);
      alert(error.message || 'Failed to verify provider. Please try again.');
    }
  };

  const getStatusBadge = (status: ProviderProfileView['verificationStatus']) => {
    if ('verified' in status) {
      return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
    }
    if ('pending' in status) {
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
    if ('rejected' in status) {
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    }
    return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" />Unverified</Badge>;
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Verification Review</h1>
          <p className="mt-2 text-muted-foreground">
            Review and verify service provider accounts
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Verification</CardTitle>
              <CardDescription>
                Review provider profiles and verify their credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Backend verification methods are currently being finalized. You can review provider profiles below, and full verification functionality will be enabled soon.
                </AlertDescription>
              </Alert>

              {providersLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading providers...</p>
                </div>
              ) : !providersForReview || providersForReview.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4">No providers pending verification at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Providers Needing Review</h3>
                    <div className="space-y-2">
                      {providersForReview.map((provider) => (
                        <button
                          key={provider.principal.toString()}
                          onClick={() => setSelectedProvider(provider.principal)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                            selectedProvider?.toString() === provider.principal.toString()
                              ? 'border-primary bg-accent'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{provider.displayName}</p>
                              <p className="text-sm text-muted-foreground">{provider.phoneNumber}</p>
                            </div>
                            {getStatusBadge(provider.verificationStatus)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Provider Details</h3>
                    {!selectedProvider ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <User className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">Select a provider to view details</p>
                        </CardContent>
                      </Card>
                    ) : providerDetailLoading ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">Loading details...</p>
                        </CardContent>
                      </Card>
                    ) : selectedProviderData ? (
                      <Card>
                        <CardContent className="space-y-4 pt-6">
                          <div>
                            <h4 className="mb-2 font-semibold">Personal Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Full Name:</span>
                                <span className="font-medium">{selectedProviderData.displayName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Surname:</span>
                                <span>{selectedProviderData.surname}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Middle Name:</span>
                                <span>{selectedProviderData.middleName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Name:</span>
                                <span>{selectedProviderData.lastName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">ID Number:</span>
                                <span>{selectedProviderData.idNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Year of Birth:</span>
                                <span>{selectedProviderData.yearOfBirth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span>{selectedProviderData.phoneNumber}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="mb-2 font-semibold">Service Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rate:</span>
                                <span>KES {selectedProviderData.rate.toString()}/hr</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Location:</span>
                                <span className="text-right">{selectedProviderData.location.address}</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="mb-2 font-semibold">Verification Status</h4>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(selectedProviderData.verificationStatus)}
                            </div>
                            {'rejected' in selectedProviderData.verificationStatus && (
                              <p className="mt-2 text-sm text-destructive">
                                Reason: {selectedProviderData.verificationStatus.rejected}
                              </p>
                            )}
                          </div>

                          <Separator />

                          <div>
                            <h4 className="mb-2 font-semibold">Documents</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>Academic Documents: {selectedProviderData.academicDocuments.length}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Good Conduct Certificate:{' '}
                                  {selectedProviderData.goodConductCert ? 'Submitted' : 'Not submitted'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleVerify(selectedProvider)}
                            disabled={verifyProvider.isPending || 'verified' in selectedProviderData.verificationStatus}
                            className="w-full"
                          >
                            {verifyProvider.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Provider
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <AlertCircle className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">Provider details not found</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <ProviderDatasetToolsPanel isAdmin={isAdmin ?? false} />
        </div>
      </div>
    </div>
  );
}
