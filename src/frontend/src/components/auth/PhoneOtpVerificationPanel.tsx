import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInitiateOtp, useVerifyOtp } from '@/hooks/useQueries';
import { OtpRole } from '@/backend';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface PhoneOtpVerificationPanelProps {
  role: OtpRole;
  onVerified: () => void;
}

export function PhoneOtpVerificationPanel({ role, onVerified }: PhoneOtpVerificationPanelProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const initiateOtpMutation = useInitiateOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleSendCode = async () => {
    setError(null);
    setSuccess(null);

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      await initiateOtpMutation.mutateAsync({ phoneNumber, role });
      setOtpSent(true);
      setSuccess('Verification code sent! Check your phone.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    setSuccess(null);

    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the verification code');
      return;
    }

    try {
      const verified = await verifyOtpMutation.mutateAsync(otpCode);
      if (verified) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        setError('Verification code has expired. Please request a new one.');
        setOtpSent(false);
        setOtpCode('');
      } else if (err.message?.includes('Invalid OTP')) {
        setError('Invalid verification code. Please try again.');
      } else {
        setError(err.message || 'Verification failed');
      }
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="mt-1 flex gap-2">
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+254 712 345 678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={otpSent}
          />
          <Button
            onClick={handleSendCode}
            disabled={initiateOtpMutation.isPending || otpSent}
            className="gap-2 whitespace-nowrap"
          >
            <Phone className="h-4 w-4" />
            {initiateOtpMutation.isPending ? 'Sending...' : 'Send code'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your phone number to receive a verification code
        </p>
      </div>

      {otpSent && (
        <div>
          <Label htmlFor="otpCode">Verification Code</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="otpCode"
              type="text"
              placeholder="Enter 4-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
            />
            <Button
              onClick={handleVerifyCode}
              disabled={verifyOtpMutation.isPending}
              className="gap-2 whitespace-nowrap"
            >
              <CheckCircle className="h-4 w-4" />
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify code'}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter the code sent to your phone
          </p>
        </div>
      )}

      {otpSent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOtpSent(false);
            setOtpCode('');
            setError(null);
            setSuccess(null);
          }}
          className="w-full"
        >
          Use a different phone number
        </Button>
      )}
    </div>
  );
}
