import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface MyJobsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function MyJobsPage({ onNavigate }: MyJobsPageProps) {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            Track your service requests and rate completed jobs
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Job management functionality coming soon</p>
            <Button onClick={() => onNavigate('categories')} className="mt-4">
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
