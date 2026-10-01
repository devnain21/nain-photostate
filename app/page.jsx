import Home from '@/src/views/Home'
import StructuredData from '@/src/components/StructuredData'
import { buildMetadata, homeFaqs, siteConfig } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC & Online Center',
  description:
    'Nain CSC & Online Center is a trusted CSC center in Danoda Kalan, Jind for Family ID, Aadhaar, PAN card, job forms, college forms, pension, LPG and document services. Search users also know it as Nain CSC Center, Nain Photostate Danoda and Jind CSC.',
  path: '/',
  keywords: [
    'Nain CSC',
    'Nain CSC Center',
    'Nain CSC Jind',
    'Nain Photostate Danoda',
    'Jind CSC',
    'Danoda CSC',
    'online forms Jind',
    'best CSC center in Jind',
  ],
})

export default function HomePage() {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteConfig.siteUrl}/#home`,
        url: siteConfig.siteUrl,
        name: 'Nain CSC & Online Center',
        description: metadata.description,
        isPartOf: {
          '@id': `${siteConfig.siteUrl}/#website`,
        },
        about: {
          '@id': `${siteConfig.siteUrl}/#localbusiness`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteConfig.siteUrl}/#faq`,
        mainEntity: homeFaqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <StructuredData data={homeSchema} />
      <Home />
    </>
  )
}