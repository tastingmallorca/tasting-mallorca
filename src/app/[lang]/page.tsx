
import { getDictionary } from '@/dictionaries/get-dictionary';
import { Locale } from '@/dictionaries/config';
import HomeClientPage from '@/app/[lang]/home-client-page';
import { findAllTours } from '../server-actions/tours/findTours';
import { findAllBlogPosts } from '../server-actions/blog/findBlogPosts';
import { findAllDestinations } from '../server-actions/destinations/findDestinations';
import { Tour } from '@/backend/tours/domain/tour.model';
import { BlogPost } from '@/backend/blog/domain/blog.model';
import { Destination } from '@/backend/destinations/domain/destination.model';
import { schemaBuilder } from '@/lib/seo/schema-builder';
import { Metadata } from 'next';

interface PageProps {
  params: {
    lang: Locale;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const { title, subtitle } = dictionary.home;
  const imageUrl = "https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Fimages%2F036.PNG?alt=media&token=00e634e2-716f-495d-807e-5c15dfe2ea09";

  return {
    title: 'Tasting Mallorca | Authentic Food & Culture Tours',
    description: subtitle,
    openGraph: {
      title: 'Tasting Mallorca | Authentic Food & Culture Tours',
      description: subtitle,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tasting Mallorca | Authentic Food & Culture Tours',
      description: subtitle,
      images: [imageUrl],
    },
  };
}


export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  const toursResult = await findAllTours({});
  const tours = toursResult.data || [];

  const postsResult = await findAllBlogPosts({});
  const posts = (postsResult.data || []).filter(p => p.published).slice(0, 3) as BlogPost[];

  const destinationsResult = await findAllDestinations({});
  const destinations = (destinationsResult.data || []).filter(d => d.published) as Destination[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            schemaBuilder.generateOrganizationSchema(),
            schemaBuilder.generateWebsiteSchema()
          ])
        }}
      />
      <HomeClientPage dictionary={dictionary} lang={lang} tours={tours as Tour[]} posts={posts} destinations={destinations} />
    </>
  );
}
