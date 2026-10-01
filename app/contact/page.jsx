import Contact from '@/src/views/Contact'
import StructuredData from '@/src/components/StructuredData'
import { buildMetadata, getAbsoluteUrl, siteConfig } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Contact Nain CSC & Online Center',
  description:
    'Contact Nain CSC & Online Center in Danoda Kalan, Jind for CSC services, online forms, document help, WhatsApp support, Google Maps directions and reviews. Local users also search this center as Nain Photostate Danoda and Jind CSC.',
  path: '/contact',
  keywords: ['Contact Nain CSC', 'Nain CSC phone number', 'Nain Photostate Danoda', 'Jind CSC contact', 'Danoda Kalan CSC contact'],
})

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${siteConfig.siteUrl}/contact#contact-page`,
        url: getAbsoluteUrl('/contact'),
        name: 'Contact Nain CSC & Online Center',
        description: metadata.description,
        mainEntity: {
          '@id': `${siteConfig.siteUrl}/#localbusiness`,
        },
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: siteConfig.phone,
        email: siteConfig.email,
        url: siteConfig.links.whatsapp,
        areaServed: ['Danoda Kalan', 'Jind', 'Haryana'],
        availableLanguage: ['Hindi', 'English'],
      },
    ],
  }

  return (
    <>
      <StructuredData data={contactSchema} />
      <Contact />
    </>
  )
}