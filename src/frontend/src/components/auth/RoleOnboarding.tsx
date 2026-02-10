import { useState } from 'react';
import { UserRole } from '../../backend';
import { useSetUserRole } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Briefcase, Shield } from 'lucide-react';

export function RoleOnboarding() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const setUserRole = useSetUserRole();

  const handleSubmit = async () => {
    if (!selectedRole) return;
    await setUserRole.mutateAsync(selectedRole);
  };

  const roles = [
    {
      value: UserRole.client,
      icon: Users,
      title: 'Client',
      description: 'I need services from professionals',
    },
    {
      value: UserRole.provider,
      icon: Briefcase,
      title: 'Service Provider',
      description: 'I offer professional services',
    },
    {
      value: UserRole.backOffice,
      icon: Shield,
      title: 'Technical Team',
      description: 'I verify service providers',
    },
  ];

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Genz App</h1>
          <p className="mt-2 text-muted-foreground">
            Please select your role to get started
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            return (
              <Card
                key={role.value}
                className={`cursor-pointer transition-all hover:shadow-soft ${
                  isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="text-xs">{role.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || setUserRole.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {setUserRole.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Setting up...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
