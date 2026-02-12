import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { FeaturedProviderAvatar } from './FeaturedProviderAvatar';

interface DemoProvider {
  name: string;
  category: string;
  rate: number;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  avatarPath: string;
  servicesWriteUp: string;
}

const demoProviders: DemoProvider[] = [
  {
    name: 'Grace Akinyi',
    category: 'Chef',
    rate: 3500,
    rating: 4.9,
    reviewCount: 38,
    location: 'Nairobi, Lavington',
    verified: true,
    avatarPath: '/assets/generated/genz-demo-avatar-grace.dim_512x512.png',
    servicesWriteUp: '',
  },
  {
    name: 'James Ochieng',
    category: 'Cleaner',
    rate: 1500,
    rating: 4.9,
    reviewCount: 47,
    location: 'Nairobi, Kilimani',
    verified: true,
    avatarPath: '/assets/generated/genz-demo-avatar-james.dim_512x512.png',
    servicesWriteUp: '',
  },
  {
    name: 'Mary Wanjiru',
    category: 'Plumber',
    rate: 2500,
    rating: 4.7,
    reviewCount: 31,
    location: 'Nairobi, Parklands',
    verified: true,
    avatarPath: '/assets/generated/genz-demo-avatar-mary.dim_512x512.png',
    servicesWriteUp: '',
  },
  {
    name: 'David Kamau',
    category: 'Gardener',
    rate: 1800,
    rating: 4.6,
    reviewCount: 19,
    location: 'Nairobi, Karen',
    verified: true,
    avatarPath: '/assets/generated/genz-demo-avatar-david.dim_512x512.png',
    servicesWriteUp: '',
  },
];

export function FeaturedProvidersSection() {
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Providers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Meet some of our top-rated professionals ready to help you
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoProviders.map((provider) => (
            <Card
              key={provider.name}
              className="transition-all hover:shadow-soft"
            >
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <FeaturedProviderAvatar 
                    name={provider.name}
                    imagePath={provider.avatarPath}
                    size="lg"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  {provider.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.location}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate</span>
                  <span className="text-lg font-semibold text-primary">
                    KES {provider.rate.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline">{provider.category}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {provider.rating.toFixed(1)} ({provider.reviewCount})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
