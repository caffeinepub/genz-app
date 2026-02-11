import { Button } from './ui/button';
import { Menu, Home, Briefcase, MapPin, FileText, Upload, Shield, User } from 'lucide-react';
import { LoginButton } from './auth/LoginButton';
import { UserRole } from '../backend';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  userRole?: UserRole;
}

export function Header({ currentPage, onNavigate, userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setMobileMenuOpen(false);
    }
  };

  const clientNavItems = [
    { page: 'categories', label: 'Browse Services', icon: Briefcase },
    { page: 'map-view', label: 'Map View', icon: MapPin },
    { page: 'my-jobs', label: 'My Jobs', icon: FileText },
    { page: 'client-profile', label: 'My Profile', icon: User },
  ];

  const providerNavItems = [
    { page: 'provider-profile', label: 'My Profile', icon: User },
    { page: 'verification-upload', label: 'Upload Documents', icon: Upload },
  ];

  const backOfficeNavItems = [
    { page: 'verification-review', label: 'Review Verifications', icon: Shield },
  ];

  const getNavItems = () => {
    if (userRole === UserRole.client) return clientNavItems;
    if (userRole === UserRole.provider) return providerNavItems;
    if (userRole === UserRole.backOffice) return backOfficeNavItems;
    return [];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/genz-app-logo.dim_512x512.png"
              alt="Genz App"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold">Genz App</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Button
              variant={currentPage === 'landing' ? 'default' : 'ghost'}
              onClick={() => handleNavigate('landing')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>

            {navItems.map((item) => (
              <Button
                key={item.page}
                variant={currentPage === item.page ? 'default' : 'ghost'}
                onClick={() => handleNavigate(item.page)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LoginButton />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-2 pt-8">
                <Button
                  variant={currentPage === 'landing' ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('landing')}
                  className="w-full justify-start gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>

                {navItems.map((item) => (
                  <Button
                    key={item.page}
                    variant={currentPage === item.page ? 'default' : 'ghost'}
                    onClick={() => handleNavigate(item.page)}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
