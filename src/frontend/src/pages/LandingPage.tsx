import { ArrowRight, Users, Shield, Star, MapPin, Briefcase, CheckCircle } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32 lg:py-40">
        <div className="animate-fade-in space-y-6">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium">
            <Briefcase className="mr-2 h-3.5 w-3.5 text-primary" />
            Connecting Kenya's Gen Z Professionals
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Find Trusted
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Service Providers
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Genz App connects you with verified professionals near you. From cleaners to electricians, 
            plumbers to chefs—find the right person for the job, fast.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-glow">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-8 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/40 bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Genz App Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple, secure platform connecting clients with verified service providers
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Browse Services"
              description="Search by category to find professionals offering cleaning, gardening, plumbing, electrical work, and more."
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Find Nearby Providers"
              description="See providers close to your location on an interactive map with real-time availability."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Verified Professionals"
              description="Our technical team verifies all service providers through document checks for your safety."
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6" />}
              title="Transparent Rates"
              description="View clear pricing upfront. Know exactly what you'll pay before connecting with a provider."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="5-Star Ratings"
              description="Rate providers after job completion to help build trust and quality within the community."
            />
            <FeatureCard
              icon={<Briefcase className="h-6 w-6" />}
              title="Fast Employment"
              description="Creating opportunities for Kenya's Gen Z workforce to connect with clients who need their skills."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft md:p-12">
            <h2 className="text-3xl font-bold tracking-tight">
              About Genz App
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Genz App is a marketplace platform designed specifically for Kenya's young professionals. 
                Whether you need a house cleaner, gardener, dog grooming specialist, plumber, chef, or 
                electrician, we connect you with verified service providers in your area.
              </p>
              <p>
                Our platform has three user types: clients who need services, service providers offering 
                their skills, and our technical team who verify providers through document checks. This 
                ensures safety and quality for everyone.
              </p>
              <p>
                After each job, clients can rate providers on a 5-star scale, building reputation and 
                trust. With transparent pricing and location-based matching, Genz App makes it easy to 
                find the right professional for your needs while creating fast employment opportunities 
                for Kenya's Gen Z workforce.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-soft">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
