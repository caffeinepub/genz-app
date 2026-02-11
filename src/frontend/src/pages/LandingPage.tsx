import { FeaturedProvidersSection } from '../components/providers/FeaturedProvidersSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { DemoVideoSection } from '../components/landing/DemoVideoSection';
import { PlatformStatsSection } from '../components/landing/PlatformStatsSection';
import { RoleQuickSelectSection } from '../components/landing/RoleQuickSelectSection';
import { UserRole } from '../backend';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, Shield, Users, Zap } from 'lucide-react';

interface LandingPageProps {
  isAuthenticated: boolean;
  userRole?: UserRole;
  profileLoading?: boolean;
  onNavigate: (page: string) => void;
}

export function LandingPage({ isAuthenticated, userRole, profileLoading, onNavigate }: LandingPageProps) {
  const handleGetStarted = () => {
    if (isAuthenticated && userRole === UserRole.client) {
      onNavigate('categories');
    } else if (isAuthenticated && userRole === UserRole.provider) {
      onNavigate('provider-profile');
    } else {
      // Not authenticated, show client access page
      onNavigate('client-access');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="landing-hero-bg relative py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Connect with Skilled Service Providers in Kenya
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Find verified professionals for all your service needs. From electricians to plumbers, 
              carpenters to IT specialists – connect instantly with trusted providers near you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={handleGetStarted} className="gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('client-access')}>
                Browse Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Quick Select */}
      <RoleQuickSelectSection 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        profileLoading={profileLoading}
        onNavigate={onNavigate}
      />

      {/* Platform Stats */}
      <PlatformStatsSection />

      {/* Featured Providers */}
      <FeaturedProvidersSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Demo Video */}
      <DemoVideoSection />

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Why Choose Genz App?</h2>
            <p className="mt-4 text-muted-foreground">
              We make it easy to find and hire trusted service providers
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Verified Providers</h3>
              <p className="mt-2 text-muted-foreground">
                All service providers are verified with background checks and qualifications
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Instant Connection</h3>
              <p className="mt-2 text-muted-foreground">
                Connect with available providers in real-time and get work done faster
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Trusted Community</h3>
              <p className="mt-2 text-muted-foreground">
                Read reviews and ratings from real clients to make informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold">About Genz App</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Genz App is Kenya's premier platform for connecting clients with skilled service providers. 
                We're building a trusted marketplace where quality work meets opportunity.
              </p>
              <p>
                Our platform focuses on technical and vocational trades, empowering skilled workers 
                to grow their businesses while helping clients find reliable professionals for their projects.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <p>Comprehensive verification process for all service providers</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <p>Real-time availability and instant connection</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <p>Transparent pricing and secure payment processing</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <p>Rating and review system for quality assurance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
