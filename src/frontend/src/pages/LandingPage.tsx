import { FeaturedProvidersSection } from '../components/providers/FeaturedProvidersSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { DemoVideoSection } from '../components/landing/DemoVideoSection';
import { PlatformStatsSection } from '../components/landing/PlatformStatsSection';
import { RoleQuickSelectSection } from '../components/landing/RoleQuickSelectSection';
import { UserRole } from '../backend';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, Shield, Users, Zap } from 'lucide-react';
import { setPendingRole } from '../utils/pendingRoleSelection';

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
      // Not authenticated, navigate to client access page
      setPendingRole(UserRole.client);
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
              Connect with Skilled{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Service Providers
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Find verified professionals for all your service needs. From plumbing to IT support,
              we connect you with trusted experts in Kenya.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 px-8" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8"
                onClick={() => {
                  const demoSection = document.getElementById('demo-section');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
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
      <section className="border-t border-border/40 bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Service Providers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Meet some of our top-rated professionals ready to serve you
            </p>
          </div>
          <div className="mt-12">
            <FeaturedProvidersSection />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Demo Video Section */}
      <div id="demo-section">
        <DemoVideoSection />
      </div>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-background py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose Genz App?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We make finding and hiring service providers simple, safe, and efficient
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Verified Professionals</h3>
              <p className="mt-2 text-muted-foreground">
                All service providers are verified with background checks and qualifications
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Quick Connections</h3>
              <p className="mt-2 text-muted-foreground">
                Find and connect with service providers in your area instantly
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Trusted Community</h3>
              <p className="mt-2 text-muted-foreground">
                Join thousands of satisfied clients and skilled professionals
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Quality Assurance</h3>
              <p className="mt-2 text-muted-foreground">
                Rate and review services to maintain high standards
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="mt-2 text-muted-foreground">
                Safe and transparent payment system with M-Pesa integration
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Support</h3>
              <p className="mt-2 text-muted-foreground">
                Our customer support team is always ready to help you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-t border-border/40 bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              About Genz App
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Genz App is Kenya's premier platform for connecting clients with skilled service
              providers. We're committed to empowering careers and making quality services
              accessible to everyone.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're looking for a plumber, electrician, chef, or IT specialist, we've got
              you covered. Our rigorous verification process ensures you're working with trusted
              professionals every time.
            </p>
            <div className="mt-10">
              <Button size="lg" onClick={handleGetStarted}>
                Join Genz App Today
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
