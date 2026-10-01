import { siteConfig } from '@/src/lib/seo'

export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/vault', '/vault/', '/jobs-admin', '/jobs-admin/', '/my-resume', '/my-resume/'],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  }
}