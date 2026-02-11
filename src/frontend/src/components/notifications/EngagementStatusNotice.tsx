import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '../ui/button';

interface EngagementStatusNoticeProps {
  isEngaged: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

export function EngagementStatusNotice({
  isEngaged,
  onDismiss,
  autoHideDuration = 5000,
}: EngagementStatusNoticeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <Alert
      className={`relative animate-in slide-in-from-top-2 ${
        isEngaged ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'
      }`}
    >
      <div className="flex items-start gap-3">
        {isEngaged ? (
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        )}
        <AlertDescription className="flex-1 font-medium">
          {isEngaged
            ? 'Provider is now Engaged'
            : 'Provider is now Not Engaged'}
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
