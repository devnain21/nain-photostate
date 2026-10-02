import { siteConfig } from '@/src/lib/seo'

export const dynamic = 'force-static'

export default function manifest() {
  return {
    name: siteConfig.businessName,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f8fc',
    theme_color: '#0d6efd',
    lang: 'hi',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/images/Shop.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/images/Shop.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
