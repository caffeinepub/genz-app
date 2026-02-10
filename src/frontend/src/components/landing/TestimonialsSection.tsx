import { forwardRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Star, Quote } from 'lucide-react';
import { FeaturedProviderAvatar } from '../providers/FeaturedProviderAvatar';

interface Testimonial {
  reviewerName: string;
  testimonialText: string;
  rating: number;
  providerName: string;
  providerCategory: string;
  providerAvatarPath: string;
}

const testimonials: Testimonial[] = [
  {
    reviewerName: 'Sarah Mwangi',
    testimonialText: 'Grace is an amazing chef! She prepared a wonderful meal for my family gathering. Professional, punctual, and the food was absolutely delicious. Highly recommend!',
    rating: 5,
    providerName: 'Grace Akinyi',
    providerCategory: 'Chef',
    providerAvatarPath: '/assets/generated/genz-demo-avatar-grace.dim_512x512.png',
  },
  {
    reviewerName: 'Peter Kimani',
    testimonialText: 'James did an excellent job cleaning my apartment. Very thorough and paid attention to every detail. My place has never looked better. Will definitely hire again!',
    rating: 5,
    providerName: 'James Ochieng',
    providerCategory: 'Cleaner',
    providerAvatarPath: '/assets/generated/genz-demo-avatar-james.dim_512x512.png',
  },
  {
    reviewerName: 'Lucy Njeri',
    testimonialText: 'Mary fixed my plumbing issue quickly and efficiently. She explained everything clearly and the price was very fair. Great service from a skilled professional!',
    rating: 5,
    providerName: 'Mary Wanjiru',
    providerCategory: 'Plumber',
    providerAvatarPath: '/assets/generated/genz-demo-avatar-mary.dim_512x512.png',
  },
  {
    reviewerName: 'John Omondi',
    testimonialText: 'David transformed my garden! He is knowledgeable, hardworking, and really cares about his work. My outdoor space looks incredible now. Thank you David!',
    rating: 5,
    providerName: 'David Kamau',
    providerCategory: 'Gardener',
    providerAvatarPath: '/assets/generated/genz-demo-avatar-david.dim_512x512.png',
  },
];

export const TestimonialsSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} className="border-t border-border/40 bg-muted/30 py-24">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Star className="h-3.5 w-3.5 fill-current" />
              Client Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real feedback from satisfied clients across Kenya
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all hover:shadow-soft">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Quote className="h-8 w-8 text-primary/20" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    "{testimonial.testimonialText}"
                  </p>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-sm font-semibold">{testimonial.reviewerName}</p>
                      <p className="text-xs text-muted-foreground">Verified Client</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-medium">{testimonial.providerName}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.providerCategory}</p>
                      </div>
                      <FeaturedProviderAvatar
                        name={testimonial.providerName}
                        imagePath={testimonial.providerAvatarPath}
                        size="sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
