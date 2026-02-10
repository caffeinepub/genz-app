import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LoginButton } from './auth/LoginButton';
import { UserRole } from '../backend';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: UserRole;
}

export function Header({ currentPage, onNavigate, userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ label: string; page: string }> = [];

  if (userRole === UserRole.client) {
    navItems.push(
      { label: 'Browse Services', page: 'categories' },
      { label: 'My Jobs', page: 'my-jobs' }
    );
  } else if (userRole === UserRole.provider) {
    navItems.push(
      { label: 'My Profile', page: 'provider-profile' },
      { label: 'Verification', page: 'verification-upload' }
    );
  } else if (userRole === UserRole.backOffice) {
    navItems.push(
      { label: 'Review Verifications', page: 'verification-review' }
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/genz-app-logo.dim_512x512.png" 
            alt="Genz App"
            className="h-10 w-10 rounded-lg object-contain shadow-sm"
          />
          <span className="text-xl font-semibold tracking-tight">
            Genz App
          </span>
        </div>
        
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate?.(item.page)}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                currentPage === item.page ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              const drawer = document.getElementById('support-drawer-trigger');
              drawer?.click();
            }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
          </button>
          <LoginButton />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LoginButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate?.(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm font-medium transition-colors hover:text-foreground ${
                  currentPage === item.page ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                const drawer = document.getElementById('support-drawer-trigger');
                drawer?.click();
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Support
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
