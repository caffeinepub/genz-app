import { useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '../ui/button';
import { usePWAInstallPrompt } from '../../hooks/usePWAInstallPrompt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function InstallPromptBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall, canShowPrompt } = usePWAInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!canShowPrompt || dismissed || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (isInstallable) {
      const installed = await promptInstall();
      if (installed) {
        setDismissed(true);
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md md:left-auto md:right-4">
        <div className="rounded-lg border border-border bg-background p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Install Genz App</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {isIOS 
                  ? 'Add to your home screen for quick access'
                  : 'Install the app for a better experience'}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1"
                >
                  {isIOS ? 'Show Instructions' : 'Install'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Genz App on iOS</DialogTitle>
            <DialogDescription>
              Follow these steps to add Genz App to your home screen:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button at the bottom of your browser
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap <strong>"Add"</strong> in the top right corner
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowIOSInstructions(false)} className="w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
