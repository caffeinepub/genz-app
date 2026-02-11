import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useState } from 'react';

export function UpdateAvailableBanner() {
  const { updateAvailable, updateAndReload } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
      <Card className="border-primary bg-primary/5 shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <RefreshCw className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Update available</p>
            <p className="text-xs text-muted-foreground">
              Refresh to get the latest version
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={updateAndReload}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
