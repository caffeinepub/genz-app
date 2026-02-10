import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatKES } from '../../utils/fees';
import { useGetCallerUserProfile, useCreateOrUpdateClientProfile } from '../../hooks/useQueries';

interface MpesaUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionFee: bigint;
  providerName: string;
  onPaymentSuccess: () => void;
  mpesaConfigAvailable: boolean;
}

type PaymentState = 'input' | 'initiating' | 'waiting' | 'success' | 'error';

export function MpesaUnlockDialog({
  open,
  onOpenChange,
  connectionFee,
  providerName,
  onPaymentSuccess,
  mpesaConfigAvailable,
}: MpesaUnlockDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const { data: userProfile } = useGetCallerUserProfile();
  const updateClientProfile = useCreateOrUpdateClientProfile();

  // Pre-fill phone number from profile
  useEffect(() => {
    if (userProfile?.clientProfile?.phoneNumber) {
      setPhoneNumber(userProfile.clientProfile.phoneNumber);
    }
  }, [userProfile]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentState('input');
      setErrorMessage('');
      setPollCount(0);
    }
  }, [open]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Kenyan phone number validation (254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX)
    const cleaned = phone.replace(/\s+/g, '');
    return /^(254\d{9}|0[17]\d{8})$/.test(cleaned);
  };

  const formatPhoneForMpesa = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleInitiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    if (!mpesaConfigAvailable) {
      setErrorMessage('M-Pesa payments are temporarily unavailable. Please try again later.');
      return;
    }

    setPaymentState('initiating');
    setErrorMessage('');

    try {
      // Save phone number to profile if not already saved
      if (!userProfile?.clientProfile?.phoneNumber || userProfile.clientProfile.phoneNumber !== phoneNumber) {
        await updateClientProfile.mutateAsync(phoneNumber);
      }

      // Simulate STK push initiation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Move to waiting state and start polling
      setPaymentState('waiting');
      setPollCount(0);
    } catch (error) {
      console.error('Payment initiation error:', error);
      setErrorMessage('Failed to initiate payment. Please try again.');
      setPaymentState('error');
    }
  };

  // Simulate polling for payment verification
  useEffect(() => {
    if (paymentState !== 'waiting') return;

    const pollInterval = setInterval(() => {
      setPollCount(prev => {
        const next = prev + 1;
        
        // Simulate successful payment after 3-5 polls (6-10 seconds)
        if (next >= 3 && Math.random() > 0.3) {
          setPaymentState('success');
          clearInterval(pollInterval);
          setTimeout(() => {
            onPaymentSuccess();
            onOpenChange(false);
          }, 2000);
        }
        
        // Timeout after 15 polls (30 seconds)
        if (next >= 15) {
          setPaymentState('error');
          setErrorMessage('Payment not confirmed yet. Please try again or check your M-Pesa messages.');
          clearInterval(pollInterval);
        }
        
        return next;
      });
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [paymentState, onPaymentSuccess, onOpenChange]);

  const handleClose = () => {
    if (paymentState === 'waiting') {
      const confirm = window.confirm('Payment verification in progress. Are you sure you want to close?');
      if (!confirm) return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>M-Pesa Payment</DialogTitle>
          <DialogDescription>
            Pay connection fee to unlock {providerName}'s contact details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Display */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount to Pay</span>
              <span className="text-2xl font-bold text-primary">{formatKES(connectionFee)}</span>
            </div>
          </div>

          {/* Payment States */}
          {paymentState === 'input' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!mpesaConfigAvailable}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              {!mpesaConfigAvailable && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    M-Pesa payments are temporarily unavailable. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleInitiatePayment}
                  disabled={!phoneNumber || !mpesaConfigAvailable}
                  className="flex-1"
                >
                  Pay Now
                </Button>
              </div>
            </>
          )}

          {paymentState === 'initiating' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Initiating M-Pesa payment...</p>
              <p className="mt-1 text-xs text-muted-foreground">Please wait</p>
            </div>
          )}

          {paymentState === 'waiting' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Waiting for M-Pesa confirmation...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check your phone for the M-Pesa prompt and enter your PIN
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Checking payment status... ({pollCount * 2}s)
              </div>
            </div>
          )}

          {paymentState === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="mt-4 text-sm font-medium">Payment confirmed!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Details unlocked. Redirecting...
              </p>
            </div>
          )}

          {paymentState === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setPaymentState('input');
                    setErrorMessage('');
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
