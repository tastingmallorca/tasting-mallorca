'use client';

import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Tour } from '@/backend/tours/domain/tour.model';
import { Locale } from '@/dictionaries/config';

interface DestinationTourCardProps {
    tour: Tour;
    lang: Locale;
}

export function DestinationTourCard({ tour, lang }: DestinationTourCardProps) {
    const slug = tour.slug[lang as keyof typeof tour.slug] || tour.slug.en;
    const title = tour.title[lang as keyof typeof tour.title] || tour.title.en;
    const description = tour.description[lang as keyof typeof tour.description] || tour.description.en;
    const duration = tour.durationHours;

    const fromLabel = {
        en: 'From',
        es: 'Desde',
        de: 'Ab',
        fr: 'À partir de',
        nl: 'Vanaf'
    };

    const durationLabel = {
        en: 'hours',
        es: 'horas',
        de: 'Stunden',
        fr: 'heures',
        nl: 'uur'
    };

    const detailsButton = {
        en: 'View Details',
        es: 'Ver Detalles',
        de: 'Details ansehen',
        fr: 'Voir les détails',
        nl: 'Bekijk details'
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/40 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/30 flex flex-col md:flex-row mb-8">
            {/* Image Section */}
            <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                {tour.mainImage ? (
                    <ImageWithSkeleton
                        src={tour.mainImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 40vw"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                )}
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {tour.hasPromotion && tour.promotionPercentage > 0 && (
                        <span className="bg-destructive/90 text-destructive-foreground backdrop-blur-md text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider animate-pulse">
                            -{tour.promotionPercentage}% OFF
                        </span>
                    )}
                    {tour.isFeatured && (
                        <span className="bg-primary/90 text-primary-foreground backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Featured
                        </span>
                    )}
                </div>

                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">{duration} {durationLabel[lang]}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="relative flex flex-col justify-between p-6 md:p-8 w-full md:w-3/5 bg-gradient-to-br from-background to-secondary/20">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
                            {tour.region} Region
                        </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                        {description}
                    </p>

                    <ul className="space-y-2 mb-6 hidden md:block">
                        <li className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>Professional Local Guide</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>Authentic Tasting Experience</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-auto pt-6 border-t border-border/50">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            {fromLabel[lang] || 'From'}
                        </span>
                        <div className="flex items-baseline gap-2">
                            {tour.hasPromotion && tour.promotionPercentage > 0 ? (
                                <>
                                    <span className="text-lg text-muted-foreground line-through decoration-destructive/50">€{tour.price}</span>
                                    <span className="text-3xl font-black text-foreground">
                                        €{Math.round(tour.price * (1 - tour.promotionPercentage / 100))}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-black text-foreground">€{tour.price}</span>
                            )}
                        </div>
                    </div>
                    
                    <Button asChild size="lg" className="w-full sm:w-auto rounded-full group/btn relative overflow-hidden">
                        <Link href={`/${lang}/tours/${slug}`}>
                            <span className="relative z-10 font-bold">{detailsButton[lang]}</span>
                            <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
