import { Users, Briefcase } from 'lucide-react';
import { useGetPlatformStats } from '../../hooks/useQueries';
import { useCountUpOnVisible } from '../../hooks/useCountUpOnVisible';

const MIN_CLIENTS = 200000;
const MIN_PROVIDERS = 250000;

export function PlatformStatsSection() {
  const { data: stats, isLoading } = useGetPlatformStats();

  const backendClients = Number(stats?.totalClients || 0);
  const backendProviders = Number(stats?.totalProviders || 0);

  // Use minimum thresholds, but show backend count if higher
  const displayClients = Math.max(backendClients, MIN_CLIENTS);
  const displayProviders = Math.max(backendProviders, MIN_PROVIDERS);

  const clientsCount = useCountUpOnVisible({ end: displayClients, duration: 2000 });
  const providersCount = useCountUpOnVisible({ end: displayProviders, duration: 2000 });

  if (isLoading) {
    return (
      <section className="border-t border-border/40 bg-background py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-8 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-muted" />
                  <div className="mx-auto mb-2 h-10 w-24 animate-pulse rounded bg-muted" />
                  <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border/40 bg-background py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Join Our Growing Community
            </h2>
            <p className="mt-2 text-muted-foreground">
              Trusted by professionals and clients across Kenya
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div 
              ref={clientsCount.elementRef}
              className="group rounded-xl border border-border bg-card p-8 text-center shadow-xs transition-all hover:shadow-soft"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Users className="h-8 w-8" />
              </div>
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                {clientsCount.count.toLocaleString()}+
              </div>
              <div className="text-lg font-medium text-muted-foreground">
                Clients Onboard
              </div>
            </div>

            <div 
              ref={providersCount.elementRef}
              className="group rounded-xl border border-border bg-card p-8 text-center shadow-xs transition-all hover:shadow-soft"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="mb-2 text-4xl font-bold text-accent sm:text-5xl">
                {providersCount.count.toLocaleString()}+
              </div>
              <div className="text-lg font-medium text-muted-foreground">
                Service Providers Onboard
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
