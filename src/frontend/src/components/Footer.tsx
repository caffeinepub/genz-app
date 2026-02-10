import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'unknown-app';

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Genz App. All rights reserved.
          </p>
          <button
            onClick={() => {
              const drawer = document.getElementById('support-drawer-trigger');
              drawer?.click();
            }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Customer Support
          </button>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Built with{' '}
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
