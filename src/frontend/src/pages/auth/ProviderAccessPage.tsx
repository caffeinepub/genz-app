import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { PhoneOtpVerificationPanel } from '@/components/auth/PhoneOtpVerificationPanel';
import { OtpRole } from '@/backend';
import { LogIn, UserPlus } from 'lucide-react';

interface ProviderAccessPageProps {
  onComplete: () => void;
}

export function ProviderAccessPage({ onComplete }: ProviderAccessPageProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuthAction = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          // Already authenticated, proceed to OTP
          setShowOtpVerification(true);
        }
      }
    } else {
      // Already authenticated, show OTP verification
      setShowOtpVerification(true);
    }
  };

  const handleOtpVerified = () => {
    onComplete();
  };

  if (showOtpVerification && isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Phone Number</CardTitle>
            <CardDescription>
              Complete phone verification to access your service provider account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneOtpVerificationPanel
              role={OtpRole.provider}
              onVerified={handleOtpVerified}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Service Provider Access</h1>
        <p className="mt-2 text-muted-foreground">
          Offer your services and connect with clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'create')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log in</TabsTrigger>
          <TabsTrigger value="create">Create new account</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Log in to your account</CardTitle>
              <CardDescription>
                Access your existing service provider account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click below to authenticate with Internet Identity and verify your phone number.
              </p>
              <Button
                onClick={handleAuthAction}
                disabled={isLoggingIn}
                className="w-full gap-2"
                size="lg"
              >
                <LogIn className="h-5 w-5" />
                {isLoggingIn ? 'Logging in...' : 'Log in with Internet Identity'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create new account</CardTitle>
              <CardDescription>
                Set up a new service provider account to offer your services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click below to create your Internet Identity and verify your phone number.
              </p>
              <Button
                onClick={handleAuthAction}
                disabled={isLoggingIn}
                className="w-full gap-2"
                size="lg"
              >
                <UserPlus className="h-5 w-5" />
                {isLoggingIn ? 'Creating account...' : 'Create account with Internet Identity'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
