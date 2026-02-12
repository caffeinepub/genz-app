import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText } from 'lucide-react';

interface MyJobsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function MyJobsPage({ onNavigate }: MyJobsPageProps) {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              My Jobs
            </CardTitle>
            <CardDescription>
              View and manage your service requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Job Management Coming Soon</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track your service requests and job history here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
