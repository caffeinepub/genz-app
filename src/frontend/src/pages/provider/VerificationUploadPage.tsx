import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export function VerificationUploadPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

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

  const verificationStatus = userProfile?.providerProfile?.verificationStatus;

  const getStatusInfo = () => {
    if (!verificationStatus) {
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        title: 'Not Submitted',
        description: 'Document upload functionality will be available soon.',
      };
    }
    if ('verified' in verificationStatus) {
      return {
        icon: CheckCircle,
        variant: 'default' as const,
        title: 'Verified',
        description: 'Your account has been verified by our technical team.',
      };
    }
    if ('pending' in verificationStatus) {
      return {
        icon: Clock,
        variant: 'default' as const,
        title: 'Pending Review',
        description: 'Your verification is being reviewed by our technical team.',
      };
    }
    if ('rejected' in verificationStatus) {
      return {
        icon: XCircle,
        variant: 'destructive' as const,
        title: 'Rejected',
        description: `Reason: ${verificationStatus.rejected}`,
      };
    }
    return {
      icon: AlertCircle,
      variant: 'default' as const,
      title: 'Unverified',
      description: 'Document upload functionality will be available soon.',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Verification Status</h1>
          <p className="mt-2 text-muted-foreground">
            Get verified to build trust with clients
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={statusInfo.variant}>
              <StatusIcon className="h-4 w-4" />
              <AlertTitle>{statusInfo.title}</AlertTitle>
              <AlertDescription>{statusInfo.description}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Document upload functionality for academic qualifications and certificates of good conduct will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
