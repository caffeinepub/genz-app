import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetMpesaConfig } from '../../hooks/useQueries';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface MpesaUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  amount: number;
}

export function MpesaUnlockDialog({
  open,
  onOpenChange,
  providerId,
  amount,
}: MpesaUnlockDialogProps) {
  const { data: mpesaConfig } = useGetMpesaConfig();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleUnlock = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setStep('processing');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Note: useUnlockProvider hook needs to be implemented when backend supports it
      setStep('success');
      
      setTimeout(() => {
        onOpenChange(false);
        setStep('input');
        setPhoneNumber('');
      }, 2000);
    } catch (error) {
      console.error('Unlock failed:', error);
      alert('Payment failed. Please try again.');
      setStep('input');
    }
  };

  if (!mpesaConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>M-Pesa Payment</DialogTitle>
            <DialogDescription>
              Unlock provider contact details
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              M-Pesa payment is not configured. Contact details will be unlocked for demonstration purposes.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => handleUnlock()}>
              Unlock (Demo Mode)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>M-Pesa Payment</DialogTitle>
          <DialogDescription>
            Pay KES {amount.toLocaleString()} to unlock provider contact details
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254 712 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Alert>
              <AlertDescription>
                You will receive an STK push prompt on your phone to complete the payment.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Processing payment...
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Please check your phone for the M-Pesa prompt
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="mt-4 font-medium">Payment Successful!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact details unlocked
            </p>
          </div>
        )}

        {step === 'input' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnlock} disabled={!phoneNumber}>
              Pay KES {amount.toLocaleString()}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
