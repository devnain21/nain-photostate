import About from '@/src/views/About'
import StructuredData from '@/src/components/StructuredData'
import { buildMetadata, getAbsoluteUrl, siteConfig } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'About Nain CSC Center in Jind',
  description:
    'Learn about Nain CSC & Online Center, also known as Nain Photostate Danoda, a trusted CSC center in Danoda Kalan, Jind focused on forms, digital services, photostate work and customer support.',
  path: '/about',
  keywords: ['About Nain CSC', 'Nain CSC Center', 'Nain Photostate Danoda', 'Jind CSC', 'online center Jind'],
})

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${siteConfig.siteUrl}/about#about-page`,
        name: 'About Nain CSC & Online Center',
        url: getAbsoluteUrl('/about'),
        description: metadata.description,
        about: {
          '@id': `${siteConfig.siteUrl}/#localbusiness`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${siteConfig.siteUrl}/#dev-nain`,
        name: 'Dev Nain',
        worksFor: {
          '@id': `${siteConfig.siteUrl}/#localbusiness`,
        },
        knowsLanguage: ['Hindi', 'English'],
      },
    ],
  }

  return (
    <>
      <StructuredData data={aboutSchema} />
      <About />
    </>
  )
}