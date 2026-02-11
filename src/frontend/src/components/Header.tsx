import { Menu, X, Download } from 'lucide-react';
import { useState } from 'react';
import { LoginButton } from './auth/LoginButton';
import { UserRole } from '../backend';
import { Button } from './ui/button';
import { usePWAInstallPrompt } from '../hooks/usePWAInstallPrompt';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: UserRole;
}

export function Header({ currentPage, onNavigate, userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [secondaryMarkLoaded, setSecondaryMarkLoaded] = useState(true);
  const { isInstallable, isIOS, promptInstall, canShowPrompt } = usePWAInstallPrompt();

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

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS instructions will be shown by the banner component
      await promptInstall();
    } else if (isInstallable) {
      await promptInstall();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-20 items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 flex-shrink-0">
          {logoLoaded && (
            <img 
              src="/assets/generated/genz-app-logo.dim_512x512.png" 
              alt="Genz App"
              className="h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14"
              onError={() => setLogoLoaded(false)}
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl">
              Genz App
            </span>
            {secondaryMarkLoaded && (
              <img 
                src="/assets/generated/Gemini_Generated_Image_g3cec6g3cec6g3ce__1_-removebg-preview-3.png" 
                alt="Genz Kenya badge"
                className="flex-shrink-0"
                onError={() => setSecondaryMarkLoaded(false)}
              />
            )}
          </div>
        </div>
        
        <nav className="hidden items-center gap-6 md:flex flex-shrink-0">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate?.(item.page)}
              className={`text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap ${
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
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          >
            Support
          </button>
          {canShowPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstallClick}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
          )}
          <LoginButton />
        </nav>

        <div className="flex items-center gap-2 md:hidden flex-shrink-0">
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
            {canShowPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInstallClick();
                  setMobileMenuOpen(false);
                }}
                className="gap-2 justify-start"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
