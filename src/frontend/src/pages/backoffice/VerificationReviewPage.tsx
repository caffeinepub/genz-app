import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function VerificationReviewPage() {
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

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Verification Review</h1>
          <p className="mt-2 text-muted-foreground">
            Review and verify service provider accounts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-muted-foreground">
              Provider verification functionality will be available in a future update.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
