import { useGetAllProviders, useUpdateVerificationStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { ProviderProfileView, VerificationStatus } from '../../backend';

export function VerificationReviewPage() {
  const { data: providers, isLoading } = useGetAllProviders();
  const updateStatus = useUpdateVerificationStatus();
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    provider: ProviderProfileView | null;
  }>({ open: false, provider: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const handleVerify = async (provider: ProviderProfileView) => {
    try {
      const status: VerificationStatus = { __kind__: 'verified', verified: null };
      await updateStatus.mutateAsync({
        provider: provider.principal,
        status,
      });
      setReviewDialog({ open: false, provider: null });
    } catch (error) {
      console.error('Failed to verify provider:', error);
      alert('Failed to verify provider. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!reviewDialog.provider || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const status: VerificationStatus = {
        __kind__: 'rejected',
        rejected: rejectionReason.trim(),
      };
      await updateStatus.mutateAsync({
        provider: reviewDialog.provider.principal,
        status,
      });
      setReviewDialog({ open: false, provider: null });
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject provider:', error);
      alert('Failed to reject provider. Please try again.');
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    if ('verified' in status) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    if ('pending' in status) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    if ('rejected' in status) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return <Badge variant="outline">Unverified</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading providers...</p>
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
            <CardTitle>All Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {!providers || providers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No providers to review
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.principal.toString()}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>{provider.phoneNumber}</TableCell>
                      <TableCell>{getStatusBadge(provider.verificationStatus)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewDialog({ open: true, provider })}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ open, provider: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Provider</DialogTitle>
            <DialogDescription>
              {reviewDialog.provider?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">
                {reviewDialog.provider?.phoneNumber}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">
                {reviewDialog.provider?.description || 'No description'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialog({ open: false, provider: null });
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateStatus.isPending || !rejectionReason.trim()}
            >
              Reject
            </Button>
            <Button
              onClick={() => reviewDialog.provider && handleVerify(reviewDialog.provider)}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Processing...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
