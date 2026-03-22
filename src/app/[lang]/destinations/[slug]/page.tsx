import { findAllDestinations, findDestinationBySlugAndLang } from '@/app/server-actions/destinations/findDestinations';
import { findAllTours } from '../../../server-actions/tours/findTours';
import { Locale } from '@/dictionaries/config';
import { notFound } from 'next/navigation';
import { schemaBuilder } from '@/lib/seo/schema-builder';
import { Metadata } from 'next';
import DestinationClientPage from './destination-client-page';
import { Tour } from '@/backend/tours/domain/tour.model';

interface DestinationPageProps {
  params: {
    lang: Locale;
    slug: string;
  };
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const { data: destination } = await findDestinationBySlugAndLang({ slug, lang });

  if (!destination) {
    return { title: 'Destination Not Found' };
  }

  const title = destination.seoTitle?.[lang as keyof typeof destination.seoTitle] || destination.name;
  const description = destination.seoDescription?.[lang as keyof typeof destination.seoDescription] || destination.shortDescription.en;
  const keywordsStr = destination.searchTags?.[lang as keyof typeof destination.searchTags]?.join(', ') || destination.searchTags?.en?.join(', ') || '';

  return {
    title,
    description,
    keywords: keywordsStr,
    openGraph: {
      title,
      description,
      images: destination.mainImage ? [
        {
          url: destination.mainImage,
          width: 1200,
          height: 630,
          alt: destination.name,
        },
      ] : [],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: destination.mainImage ? [destination.mainImage] : [],
    },
    alternates: {
      canonical: `/${lang}/destinations/${slug}`,
    },
  };
}


export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  
  const languages = ['en', 'es', 'de', 'fr', 'nl'];
  
  const { data: allDests } = await findAllDestinations({});
  const result = allDests || [];
  
  for (const lang of languages) {
    for (const destination of result) {
      if (destination.slug[lang as keyof typeof destination.slug]) {
          params.push({ lang, slug: destination.slug[lang as keyof typeof destination.slug] });
      }
    }
  }

  return params;
}


export default async function Page({ params }: DestinationPageProps) {
  const { lang, slug } = await params;
  
  const { data: destination } = await findDestinationBySlugAndLang({ slug, lang });
  
  if (!destination) {
    notFound();
  }

  const toursResult = await findAllTours({});
  const allTours = toursResult.data || [];

  // Filter tours conceptually related to this destination
  const nameRegex = new RegExp(destination.name, 'i');
  
  const relatedTours = allTours.filter((tour: Tour) => {
    if (!tour.published) return false;
    
    const title = tour.title[lang as keyof typeof tour.title] || tour.title.en || '';
    const desc = tour.description[lang as keyof typeof tour.description] || tour.description.en || '';
    const overview = tour.overview?.[lang as keyof typeof tour.overview] || tour.overview?.en || '';
    
    // Also check itinerary stops
    let inItinerary = false;
    if (tour.itinerary && Array.isArray(tour.itinerary)) {
        inItinerary = tour.itinerary.some((item: any) => {
            const itemTitle = item.title?.[lang as keyof typeof item.title] || item.title?.en || '';
            return nameRegex.test(itemTitle);
        });
    }

    return nameRegex.test(title) || nameRegex.test(desc) || nameRegex.test(overview) || inItinerary;
  });

  // Basic TouristDestination schema
  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destination.name,
    "description": destination.longDescription[lang as keyof typeof destination.longDescription] || destination.longDescription.en,
    "image": destination.mainImage,
    "url": `https://tasting-mallorca.com/${lang}/destinations/${slug}`,
    "touristType": [
      {
        "@type": "Audience",
        "audienceType": "Tourists"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(destinationSchema)
        }}
      />
      <DestinationClientPage 
        // @ts-ignore
        destination={destination} 
        tours={relatedTours as Tour[]} 
        lang={lang as Locale} 
      />
    </>
  );
}
