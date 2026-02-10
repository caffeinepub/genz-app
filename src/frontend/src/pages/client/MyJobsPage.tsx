import { useGetCallerJobs, useMarkJobCompleted, useCancelJob } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StarRatingInput } from '../../components/ratings/StarRatingInput';
import { useState } from 'react';
import { Job } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface MyJobsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function MyJobsPage({ onNavigate }: MyJobsPageProps) {
  const { data: jobs, isLoading } = useGetCallerJobs();
  const markCompleted = useMarkJobCompleted();
  const cancelJob = useCancelJob();
  const [ratingDialog, setRatingDialog] = useState<{ open: boolean; job: Job | null }>({
    open: false,
    job: null,
  });
  const [rating, setRating] = useState(5);

  const handleComplete = async () => {
    if (!ratingDialog.job) return;
    
    try {
      await markCompleted.mutateAsync({
        jobId: ratingDialog.job.id,
        rating: BigInt(rating),
      });
      setRatingDialog({ open: false, job: null });
      setRating(5);
    } catch (error) {
      console.error('Failed to complete job:', error);
      alert('Failed to complete job. Please try again.');
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    
    try {
      await cancelJob.mutateAsync({
        jobId,
        reason: 'Cancelled by client',
      });
    } catch (error) {
      console.error('Failed to cancel job:', error);
      alert('Failed to cancel job. Please try again.');
    }
  };

  const getStatusBadge = (job: Job) => {
    if ('requested' in job.status) {
      return <Badge variant="secondary">Requested</Badge>;
    }
    if ('inProgress' in job.status) {
      return <Badge variant="default">In Progress</Badge>;
    }
    if ('completed' in job.status) {
      return <Badge variant="outline">Completed</Badge>;
    }
    if ('cancelled' in job.status) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            Track your service requests and rate completed jobs
          </p>
        </div>

        {!jobs || jobs.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No jobs yet</p>
              <Button onClick={() => onNavigate('categories')} className="mt-4">
                Browse Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Job Request</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Provider: {job.provider.toString().slice(0, 10)}...
                      </p>
                    </div>
                    {getStatusBadge(job)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment</span>
                    <span className="font-semibold text-primary">
                      KES {Number(job.payment).toLocaleString()}
                    </span>
                  </div>

                  {'inProgress' in job.status && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setRatingDialog({ open: true, job })}
                        size="sm"
                        disabled={markCompleted.isPending}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        onClick={() => handleCancel(job.id)}
                        variant="outline"
                        size="sm"
                        disabled={cancelJob.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {'requested' in job.status && (
                    <Button
                      onClick={() => handleCancel(job.id)}
                      variant="outline"
                      size="sm"
                      disabled={cancelJob.isPending}
                    >
                      Cancel Request
                    </Button>
                  )}

                  {'completed' in job.status && (
                    <div className="text-sm text-muted-foreground">
                      Rated: {Number(job.status.completed.rating)} stars
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={ratingDialog.open} onOpenChange={(open) => setRatingDialog({ open, job: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job & Rate Provider</DialogTitle>
            <DialogDescription>
              How would you rate this service provider?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingDialog({ open: false, job: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={markCompleted.isPending}>
              {markCompleted.isPending ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
