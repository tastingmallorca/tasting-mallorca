'use client';

import { SectionBadge } from '@/components/ui/section-badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, MapPin } from 'lucide-react';
import { type getDictionary } from '@/dictionaries/get-dictionary';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Destination } from '@/backend/destinations/domain/destination.model';

type TopDestinationsProps = {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['destinations'];
    destinations: Destination[];
}

// Add local layout classes matching the old design
const classNamesForDestinations = [
    'md:col-span-2',
    'md:row-span-2',
    '',
    '',
    '',
    'md:col-span-2'
];

const DestinationGridItem = ({ dest, index }: { dest: Destination, index: number }) => {
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams<{ lang: string }>();
    const lang = params?.lang || 'en';
    const gridClass = classNamesForDestinations[index % classNamesForDestinations.length];

    return (
        <Link
            href={`/${lang}/destinations/${dest.slug[lang] || dest.slug.en}`}
            className={`relative rounded-2xl overflow-hidden group h-full cursor-pointer block ${gridClass}`}
        >
            {isLoading && <Skeleton className="absolute inset-0 w-full h-full z-0" />}
            {dest.mainImage ? (
                <Image
                    src={dest.mainImage}
                    alt={dest.name}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100 z-0'}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    onLoad={() => setIsLoading(false)}
                />
            ) : (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl z-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>

            {/* Glassmorphism Title Card */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-2xl">
                    <h3 className="text-2xl font-black text-white text-center tracking-tight drop-shadow-md">{dest.name}</h3>
                    <p className="text-white/80 text-sm text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 hidden md:block">
                        Explore Tours & Experiences
                    </p>
                </div>
            </div>

            <div className="absolute top-4 right-4 h-12 w-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:rotate-45 group-hover:bg-primary group-hover:scale-110 shadow-lg z-10">
                <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
        </Link>
    );
};

export function TopDestinationsSection({ dictionary, destinations }: TopDestinationsProps) {
    const mainDestinations = destinations.slice(0, 6);

    return (
        <section className="py-24 bg-background flex flex-col items-center">
            <div className="container text-center mb-12">
                <SectionBadge className="mb-4">
                    <MapPin className="w-5 h-5" />
                    {dictionary.subtitle}
                </SectionBadge>
                <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-foreground">{dictionary.title}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    {dictionary.description}
                </p>
            </div>
            <div className="w-full px-4 md:px-0 md:w-[80vw] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[350px] gap-4">
                    {mainDestinations.map((dest, index) => (
                        <DestinationGridItem key={dest.id} dest={dest} index={index} />
                    ))}
                    <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-secondary to-background border border-border/50 shadow-sm flex flex-col items-center justify-center text-center lg:col-span-3 transition-colors hover:border-primary/30">
                        <h3 className="text-3xl font-extrabold text-foreground">{dictionary.ctaTitle}</h3>
                        <p className="mt-3 text-lg text-muted-foreground">{dictionary.ctaSubtitle}</p>
                        <Button asChild size="lg" className="mt-8 font-bold rounded-full group px-8">
                            <Link href="/tours">
                                {dictionary.ctaButton}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
