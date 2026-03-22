
'use client';

import { type getDictionary } from '@/dictionaries/get-dictionary';
import { HeroSection } from '@/components/home/hero-section';
import { ImmersiveCarouselSection } from '@/components/home/immersive-carousel-section';
import { TopDestinationsSection } from '@/components/home/top-destinations-section';
import { WhatsIncludedSection } from '@/components/home/whats-included-section';
import { WhyChooseUsSection } from '@/components/home/why-choose-us-section';
import { FeaturedToursSection } from '@/components/home/featured-tours-section';
import { GallerySection } from '@/components/home/gallery-section';
import { HappyCustomersSection } from '@/components/home/happy-customers-section';
import { TourGuidesSection } from '@/components/home/tour-guides-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { BlogSection } from '@/components/home/blog-section';
import { type Locale } from '@/dictionaries/config';
import { Tour } from '@/backend/tours/domain/tour.model';
import { BlogPost } from '@/backend/blog/domain/blog.model';
import { Destination } from '@/backend/destinations/domain/destination.model';
import { PrivateToursCtaSection } from '@/components/home/private-tours-cta-section';


export default function HomeClientPage({
  dictionary,
  lang,
  tours,
  posts,
  destinations
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: Locale;
  tours: Tour[];
  posts: BlogPost[];
  destinations: Destination[];
}) {
  return (
    <div className="flex flex-col bg-background">
      <HeroSection dictionary={dictionary.home} />
      <ImmersiveCarouselSection />
      <FeaturedToursSection dictionary={dictionary.featuredTours} lang={lang} tours={tours} />
      <WhatsIncludedSection dictionary={dictionary.whatsIncluded} />
      <WhyChooseUsSection dictionary={dictionary.whyChooseUs} />
      <PrivateToursCtaSection dictionary={dictionary.privateToursCta} lang={lang} />
      <GallerySection dictionary={dictionary.gallery} />
      <HappyCustomersSection dictionary={dictionary.happyCustomers} />
      <TopDestinationsSection dictionary={dictionary.destinations} destinations={destinations} />
      <TestimonialsSection dictionary={dictionary.testimonials} />
      <BlogSection dictionary={dictionary.blog} posts={posts} lang={lang} />
    </div>
  );
}
