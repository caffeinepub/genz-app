import { Users, Briefcase, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UserRole } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { setPendingRole } from '../../utils/pendingRoleSelection';

interface RoleQuickSelectSectionProps {
  isAuthenticated?: boolean;
  userRole?: UserRole;
  profileLoading?: boolean;
  onNavigate?: (page: string) => void;
}

export function RoleQuickSelectSection({
  isAuthenticated = false,
  userRole,
  profileLoading = false,
  onNavigate,
}: RoleQuickSelectSectionProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  const roles = [
    {
      value: UserRole.client,
      icon: Users,
      title: 'Client',
      description: 'I need services from professionals',
      targetPage: 'categories',
    },
    {
      value: UserRole.provider,
      icon: Briefcase,
      title: 'Service Provider',
      description: 'I offer professional services',
      targetPage: 'provider-profile',
    },
    {
      value: UserRole.backOffice,
      icon: Shield,
      title: 'Technical Team',
      description: 'I verify service providers',
      targetPage: 'verification-review',
    },
  ];

  const handleRoleClick = async (role: UserRole, targetPage: string) => {
    if (!isAuthenticated) {
      // Store the selected role and trigger login
      setPendingRole(role);
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        // Clear pending role if login fails
        if (error.message !== 'User is already authenticated') {
          setPendingRole(role); // Keep it for retry
        }
      }
    } else if (onNavigate && !profileLoading) {
      // Navigate to the appropriate page for authenticated users
      onNavigate(targetPage);
    }
  };

  const isDisabled = isLoggingIn || (isAuthenticated && profileLoading);

  return (
    <section className="border-t border-border/40 bg-background py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Role
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {isAuthenticated
              ? 'Quick access to your dashboard'
              : 'Select your role to get started quickly'}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isCurrentRole = isAuthenticated && userRole === role.value;

            return (
              <Card
                key={role.value}
                className={`group relative cursor-pointer transition-all hover:shadow-soft ${
                  isCurrentRole ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    onClick={() => handleRoleClick(role.value, role.targetPage)}
                    disabled={isDisabled}
                    variant={isCurrentRole ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : profileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : isAuthenticated ? (
                      isCurrentRole ? 'Go to Dashboard' : 'Switch Role'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
