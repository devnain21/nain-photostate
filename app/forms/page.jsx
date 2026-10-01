import Forms from '@/src/views/Forms'
import StructuredData from '@/src/components/StructuredData'
import { buildBreadcrumbSchema, buildCollectionPageSchema, buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC Forms & Document Services in Jind',
  description:
    'Apply and track important online forms at Nain CSC Center in Danoda Kalan, Jind for Family ID, certificates, IDs, student forms and government services. Many local users also know this desk as Nain Photostate Danoda.',
  path: '/forms',
  keywords: ['Nain CSC forms', 'Nain CSC Center', 'online forms Jind', 'government forms Jind', 'Nain Photostate Danoda'],
})

export default function FormsPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageSchema({
          title: metadata.title,
          description: metadata.description,
          path: '/forms',
          about: ['Offline forms', 'Government document PDFs', 'Student forms', 'Certificate forms'],
          keywords: metadata.keywords,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Forms', path: '/forms' },
        ])}
      />
      <Forms />
    </>
  )
}