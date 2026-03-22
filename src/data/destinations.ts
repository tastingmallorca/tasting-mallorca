export interface DestinationData {
  id: string;
  slug: string;
  name: string;
  image: string;
  imageHint: string;
  shortDescription: {
    en: string;
    es: string;
    de?: string;
    fr?: string;
  };
  longDescription: {
    en: string;
    es: string;
    de?: string;
    fr?: string;
  };
  seo: {
    title: { [key: string]: string };
    description: { [key: string]: string };
    keywords: { [key: string]: string[] };
  };
}

export const staticDestinations: DestinationData[] = [
  {
    id: 'dest-arta',
    slug: 'arta',
    name: 'Artà',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FArta.png?alt=media&token=fa3396de-9c44-480d-aec5-a048344d772f',
    imageHint: 'Artà landscape and historic buildings',
    shortDescription: {
      en: 'Discover the medieval charm and pristine coastlines of Artà.',
      es: 'Descubre el encanto medieval y las costas vírgenes de Artà.'
    },
    longDescription: {
      en: 'Nestled in the northeast of Mallorca, Artà is a hidden gem that blends rich history, authentic culture, and stunning natural landscapes. Wander through its narrow streets, visit the Sanctuary of Sant Salvador, and explore local artisanal shops. It is the perfect starting point for discovering some of the island\'s most beautiful hidden coves and traditional gastronomy.',
      es: 'Situada en el noreste de Mallorca, Artà es una joya escondida que combina una rica historia, cultura auténtica y paisajes naturales impresionantes. Pasea por sus estrechas calles, visita el Santuario de Sant Salvador y explora las tiendas de artesanía local. Es el punto de partida perfecto para descubrir algunas de las calas escondidas más hermosas de la isla y su gastronomía tradicional.'
    },
    seo: {
      title: {
        en: 'Explore Artà | Top Destinations in Mallorca | Tasting Mallorca',
        es: 'Explora Artà | Destinos Top en Mallorca | Tasting Mallorca'
      },
      description: {
        en: 'Visit Artà, Mallorca. Discover medieval streets, authentic culture, and stunning landscapes. Book your unforgettable tour around Artà today.',
        es: 'Visita Artà, Mallorca. Descubre calles medievales, cultura auténtica y paisajes impresionantes. Reserva tu tour inolvidable por Artà hoy mismo.'
      },
      keywords: {
        en: ['Arta', 'Mallorca', 'Tours in Arta', 'Sant Salvador', 'Medieval Town Mallorca', 'Northeast Mallorca'],
        es: ['Artà', 'Mallorca', 'Tours en Artà', 'Sant Salvador', 'Pueblo medieval Mallorca', 'Noreste de Mallorca']
      }
    }
  },
  {
    id: 'dest-ermita-bonany',
    slug: 'ermita-de-bonany',
    name: 'Ermita de Bonany',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FErmita%20de%20Bonany.jpg?alt=media&token=fc73a916-e8a4-4af9-b0eb-a97d79df51f9',
    imageHint: 'Ermita de Bonany church on top of a hill',
    shortDescription: {
      en: 'Experience breathtaking panoramic views from this historic hilltop sanctuary.',
      es: 'Experimenta unas vistas panorámicas impresionantes desde este santuario histórico en la cima de la colina.'
    },
    longDescription: {
      en: 'Perched high above the Mallorcan plains near Petra, the Ermita de Bonany is a sanctuary offering peace, spirituality, and unparalleled 360-degree views of the island. Built in the 17th century, it remains a site of pilgrimage and a magnificent spot to witness spectacular sunsets, making it a must-visit for nature and history lovers alike.',
      es: 'Enclavada en lo alto de las llanuras mallorquinas cerca de Petra, la Ermita de Bonany es un santuario que ofrece paz, espiritualidad y unas vistas de 360 grados inigualables de la isla. Construida en el siglo XVII, sigue siendo un lugar de peregrinación y un lugar magnífico para presenciar atardeceres espectaculares, lo que la convierte en una visita obligada para los amantes de la naturaleza y la historia.'
    },
    seo: {
      title: {
        en: 'Ermita de Bonany Views | Mallorca Destinations | Tasting Mallorca',
        es: 'Vistas desde Ermita de Bonany | Destinos en Mallorca | Tasting Mallorca'
      },
      description: {
        en: 'Discover the historic Ermita de Bonany in Mallorca. Enjoy stunning panoramic island views from this 17th-century sanctuary.',
        es: 'Descubre la histórica Ermita de Bonany en Mallorca. Disfruta de unas vistas panorámicas impresionantes de la isla desde este santuario del siglo XVII.'
      },
      keywords: {
        en: ['Ermita de Bonany', 'Mallorca viewpoints', 'Petra Mallorca', 'Historic Sanctuaries', 'Mallorca Tours'],
        es: ['Ermita de Bonany', 'Miradores de Mallorca', 'Petra Mallorca', 'Santuarios históricos', 'Tours en Mallorca']
      }
    }
  },
  {
    id: 'dest-mirador-es-grau',
    slug: 'mirador-es-grau',
    name: 'Mirador Es Grau',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FMirador%20Es%20Grau.jpg?alt=media&token=4b952542-71ac-4ad5-a441-52ed163fcc9d',
    imageHint: 'Mirador Es Grau stunning coastal view over the Mediterranean',
    shortDescription: {
      en: 'Gaze out over the dramatic cliffs and endless blue of the Mediterranean Sea.',
      es: 'Contempla los espectaculares acantilados y el azul infinito del Mar Mediterráneo.'
    },
    longDescription: {
      en: 'Mirador Es Grau is one of the most spectacular viewpoints on Mallorca\'s rugged west coast, nestled along the famous Tramuntana mountain range routes. Offering dramatic, steep cliffs plunging straight into the deep blue Mediterranean, it is a favourite stop for photographers, cyclists, and anyone seeking the raw, untamed beauty of the island.',
      es: 'El Mirador Es Grau es uno de los miradores más espectaculares de la escarpada costa oeste de Mallorca, situado en las famosas rutas de la sierra de Tramuntana. Ofrece acantilados escarpados y dramáticos que se hunden directamente en el azul profundo del Mediterráneo y es una parada favorita de fotógrafos, ciclistas y cualquiera que busque la belleza cruda e indómita de la isla.'
    },
    seo: {
      title: {
        en: 'Mirador Es Grau | Tramuntana Coastal Views | Tasting Mallorca',
        es: 'Mirador Es Grau | Vistas de la Costa de Tramuntana | Tasting Mallorca'
      },
      description: {
        en: 'Experience the breathtaking cliffs and sea views at Mirador Es Grau, located on Mallorca\'s spectacular Tramuntana coast.',
        es: 'Experimenta los impresionantes acantilados y vistas al mar en el Mirador Es Grau, situado en la espectacular costa de la Tramuntana de Mallorca.'
      },
      keywords: {
        en: ['Mirador Es Grau', 'Tramuntana Mountains', 'Mallorca Viewpoints', 'West Coast Mallorca', 'Coastal landscapes'],
        es: ['Mirador Es Grau', 'Sierra de Tramuntana', 'Miradores Mallorca', 'Costa Oeste Mallorca', 'Paisajes costeros']
      }
    }
  },
  {
    id: 'dest-petra',
    slug: 'petra',
    name: 'Petra',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FPetra.jpg?alt=media&token=03514b21-ff6c-4a97-a92f-cb0bf73a3b8b',
    imageHint: 'Petra village quaint streets and stone architecture',
    shortDescription: {
      en: 'Step back in time in the historic birthplace of Fray Junípero Serra.',
      es: 'Retrocede en el tiempo en el lugar de nacimiento histórico de Fray Junípero Serra.'
    },
    longDescription: {
      en: 'Petra is a quintessential Mallorcan inland village, characterized by golden-stoned houses, tranquil squares, and a rich agricultural heritage. Famous worldwide as the birthplace of Fray Junípero Serra, founder of the California missions, Petra offers visitors a deep dive into the authentic rural heart of the island where time seems to stand beautifully still.',
      es: 'Petra es un pueblo típico del interior de Mallorca, caracterizado por casas de piedra dorada, plazas tranquilas y un rico patrimonio agrícola. Famoso en todo el mundo como el lugar de nacimiento de Fray Junípero Serra, fundador de las misiones de California, Petra ofrece a los visitantes una inmersión profunda en el auténtico corazón rural de la isla, donde el tiempo parece detenerse maravillosamente.'
    },
    seo: {
      title: {
        en: 'Visit Petra Mallorca | Historic Inland Village | Tasting Mallorca',
        es: 'Visita Petra Mallorca | Pueblo histórico del interior | Tasting Mallorca'
      },
      description: {
        en: 'Explore the historic streets of Petra, Mallorca. Discover authentic rural charm and the legacy of Junípero Serra in this beautiful inland village.',
        es: 'Explora las calles históricas de Petra, Mallorca. Descubre el auténtico encanto rural y el legado de Junípero Serra en este hermoso pueblo de interior.'
      },
      keywords: {
        en: ['Petra Mallorca', 'Junípero Serra', 'Inland Villages Mallorca', 'Rural Mallorca', 'Historic Towns'],
        es: ['Petra Mallorca', 'Junípero Serra', 'Pueblos de interior Mallorca', 'Mallorca Rural', 'Pueblos históricos']
      }
    }
  },
  {
    id: 'dest-sineu',
    slug: 'sineu',
    name: 'Sineu',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FSineu.jpg?alt=media&token=d9b7b93a-a07a-4624-9014-504394f37483',
    imageHint: 'Sineu vibrant market and architecture',
    shortDescription: {
      en: 'Experience the vibrant colors and flavors of Mallorca\'s most traditional market town.',
      es: 'Experimenta los vibrantes colores y sabores de la ciudad comercial más tradicional de Mallorca.'
    },
    longDescription: {
      en: 'Located right in the geographical center of Mallorca, Sineu was once the residence of the Kings of Mallorca. Today, it is most famous for its lively weekly farmer\'s market, which has been held every Wednesday since 1306. A wander through Sineu gives you a genuine taste of local life, agricultural traditions, and historical architecture.',
      es: 'Situada justo en el centro geográfico de Mallorca, Sineu fue en el pasado la residencia de los Reyes de Mallorca. Hoy en día, es más famoso por su animado mercado agrícola semanal, que se celebra todos los miércoles desde 1306. Un paseo por Sineu le dará una muestra auténtica de la vida local, las tradiciones agrícolas y la arquitectura histórica.'
    },
    seo: {
      title: {
        en: 'Sineu Traditional Market & Village | Tasting Mallorca',
        es: 'Mercado tradicional y pueblo de Sineu | Tasting Mallorca'
      },
      description: {
        en: 'Visit Sineu, the heart of Mallorca. Experience the famous Wednesday market, rich history, and local agriculture in this central island town.',
        es: 'Visita Sineu, el corazón de Mallorca. Experimenta el famoso mercado de los miércoles, la rica historia y la agricultura local en este pueblo del centro de la isla.'
      },
      keywords: {
        en: ['Sineu Market', 'Mallorca Center', 'Traditional Markets Mallorca', 'Historic Sineu', 'Wednesday Market'],
        es: ['Mercado de Sineu', 'Centro de Mallorca', 'Mercados tradicionales Mallorca', 'Sineu Histórico', 'Mercado de los Miércoles']
      }
    }
  },
  {
    id: 'dest-valldemossa',
    slug: 'valldemossa',
    name: 'Valldemossa',
    image: 'https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Ffotos%20top%20destinations%2FVALLDEMOSSA%202.jpg?alt=media&token=05d35042-3bac-419e-8095-046cb75d7bc5',
    imageHint: 'Valldemossa cobblestone streets and mountain backdrop',
    shortDescription: {
      en: 'Roam the romantic cobblestone streets nestled in the Tramuntana mountains.',
      es: 'Pasea por las románticas calles empedradas situadas en la sierra de Tramuntana.'
    },
    longDescription: {
      en: 'Valldemossa is arguably Mallorca\'s most famous and picturesque mountain village. Encompassed by the Tramuntana range and draped in lush greenery, its cobbled streets, flower-filled alleys, and the grand Carthusian Monastery have inspired artists and writers like Frédéric Chopin and George Sand. Treat yourself to a traditional "coca de patata" while soaking in the romantic atmosphere.',
      es: 'Valldemossa es indiscutiblemente el pueblo de montaña más famoso y pintoresco de Mallorca. Rodeada por la sierra de Tramuntana y cubierta de exuberante vegetación, sus calles empedradas, callejones llenos de flores y la gran Cartuja han inspirado a artistas y escritores como Frédéric Chopin y George Sand. Disfrute de una tradicional "coca de patata" mientras se sumerge en la atmósfera romántica.'
    },
    seo: {
      title: {
        en: 'Discover Valldemossa | Tramuntana Mountain Village | Tasting Mallorca',
        es: 'Descubre Valldemossa | Pueblo de la Sierra de Tramuntana | Tasting Mallorca'
      },
      description: {
        en: 'Explore Valldemossa, Mallorca\'s most romantic village. Wander through beautiful mountain streets, visit the monastery, and enjoy local pastries.',
        es: 'Explora Valldemossa, el pueblo más romántico de Mallorca. Pasea por hermosas calles de montaña, visita el monasterio y disfruta de la repostería local.'
      },
      keywords: {
        en: ['Valldemossa', 'Tramuntana Villages', 'Chopin Mallorca', 'Carthusian Monastery', 'Mallorca mountains'],
        es: ['Valldemossa', 'Pueblos de Tramuntana', 'Chopin Mallorca', 'Cartuja de Valldemossa', 'Montañas de Mallorca']
      }
    }
  }
];

export async function getDestinationBySlug(slug: string): Promise<DestinationData | undefined> {
  return staticDestinations.find((dest) => dest.slug === slug);
}
