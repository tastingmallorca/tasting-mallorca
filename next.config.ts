


const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://apis.google.com https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://js.stripe.com https://m.stripe.network;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.google.es https://www.googleadservices.com https://pagead2.googlesyndication.com https://www.facebook.com https://connect.facebook.net https://googleads.g.doubleclick.net https://firebasestorage.googleapis.com https://images.unsplash.com https://picsum.photos https://placehold.co https://*.stripe.com https://maps.googleapis.com https://maps.gstatic.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://api.stripe.com https://maps.googleapis.com https://m.stripe.network https://firestore.googleapis.com https://www.google.com;
    media-src 'self' https://firebasestorage.googleapis.com;
    frame-src 'self' https://*.googletagmanager.com https://www.facebook.com https://googleads.g.doubleclick.net https://js.stripe.com https://hooks.stripe.com https://www.google.com https://amparo-aesthetics.firebaseapp.com https://tasting-mallorca.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
};

module.exports = nextConfig;
