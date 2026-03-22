'use client';

import { DestinationData } from '@/data/destinations';
import { Tour } from '@/backend/tours/domain/tour.model';
import { Locale } from '@/dictionaries/config';
import Image from 'next/image';
import { MapPin, Info, Compass } from 'lucide-react';
import { DestinationTourCard } from '@/components/destinations/destination-tour-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DestinationClientPageProps {
  destination: DestinationData | any;
  tours: Tour[];
  lang: Locale;
}

export default function DestinationClientPage({ destination, tours, lang }: DestinationClientPageProps) {
  const shortDesc = destination.shortDescription[lang as keyof typeof destination.shortDescription] || destination.shortDescription.en;
  const longDesc = destination.longDescription[lang as keyof typeof destination.longDescription] || destination.longDescription.en;

  const noToursMessage = {
    en: 'We are currently updating our experiences in this area. Please check back soon or explore our other tours!',
    es: 'Actualmente estamos actualizando nuestras experiencias en esta área. ¡Vuelve pronto o explora nuestros otros tours!',
    de: 'Wir aktualisieren derzeit unsere Erlebnisse in diesem Bereich. Bitte schauen Sie bald wieder vorbei oder erkunden Sie unsere anderen Touren!',
    fr: 'Nous mettons actuellement à jour nos expériences dans ce domaine. Veuillez revenir bientôt ou explorer nos autres circuits !',
    nl: 'We werken momenteel onze ervaringen in dit gebied bij. Kom snel terug of bekijk onze andere tours!'
  };

  const backHome = {
    en: 'Explore all tours',
    es: 'Explorar todos los tours',
    de: 'Alle Touren erkunden',
    fr: 'Explorer tous les circuits',
    nl: 'Bekijk alle tours'
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Dynamic Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {(destination.mainImage || destination.image) ? (
          <Image
            src={destination.mainImage || destination.image}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20 pb-24 md:pb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-6 animate-fade-in">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold tracking-wide uppercase">Mallorca Destination</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
            Explore {destination.name}
          </h1>
          <p className="text-xl md:text-2xl text-white font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-2xl mx-auto">
            {shortDesc}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-7xl mx-auto px-4 -mt-16 md:-mt-24 relative z-20 flex flex-col gap-12">
        
        {/* Destination Information Glass Card */}
        <section className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Info className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">About the Destination</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {longDesc}
          </p>
        </section>

        {/* Tours Section */}
        <section className="pt-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Recommended Experiences in {destination.name}
              </h2>
              <p className="text-muted-foreground mt-2 font-medium">
                Immerse yourself in hand-picked tours related to this beautiful destination.
              </p>
            </div>
          </div>

          {tours.length > 0 ? (
            <div className="flex flex-col gap-8">
              {tours.map(tour => (
                <DestinationTourCard key={tour.id} tour={tour} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-3xl p-12 text-center border border-border/50 flex flex-col items-center">
              <Compass className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">No specific tours available yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {noToursMessage[lang as keyof typeof noToursMessage] || noToursMessage.en}
              </p>
              <Button asChild size="lg" className="rounded-full font-bold">
                <Link href={`/${lang}/tours`}>
                  {backHome[lang as keyof typeof backHome] || backHome.en}
                </Link>
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
