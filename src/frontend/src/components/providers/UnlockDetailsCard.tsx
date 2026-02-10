import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Lock, Info } from 'lucide-react';
import { formatKES } from '../../utils/fees';

interface UnlockDetailsCardProps {
  connectionFee: bigint;
  providerName: string;
  onUnlock: () => void;
  isUnlocking?: boolean;
}

export function UnlockDetailsCard({
  connectionFee,
  providerName,
  onUnlock,
  isUnlocking = false,
}: UnlockDetailsCardProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Contact Details Locked</CardTitle>
        </div>
        <CardDescription>
          Pay a connection fee to unlock full contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1 text-sm text-muted-foreground">
              <p className="mb-2">
                To protect service providers and ensure serious inquiries, we require a{' '}
                <strong>10% connection fee</strong> before revealing full contact details.
              </p>
              <p>
                This fee helps maintain quality connections and supports the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Provider</span>
            <span className="font-medium">{providerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection Fee (10%)</span>
            <span className="text-xl font-bold text-primary">{formatKES(connectionFee)}</span>
          </div>
        </div>

        <Button
          onClick={onUnlock}
          disabled={isUnlocking}
          className="w-full"
          size="lg"
        >
          {isUnlocking ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Unlock Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
