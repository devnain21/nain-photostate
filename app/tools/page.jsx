import Tools from '@/src/views/Tools'
import StructuredData from '@/src/components/StructuredData'
import { buildBreadcrumbSchema, buildCollectionPageSchema, buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC Digital Tools for Jind',
  description:
    'Use essential digital tools from Nain CSC & Online Center, including LPG links, resume maker, document helpers and everyday CSC work utilities. Local visitors also know this center as Nain Photostate Danoda.',
  path: '/tools',
  keywords: ['Nain CSC tools', 'Nain CSC Center', 'digital tools Jind', 'CSC tools Jind', 'Nain Photostate Danoda'],
})

export default function ToolsPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageSchema({
          title: metadata.title,
          description: metadata.description,
          path: '/tools',
          about: ['Digital tools', 'Resume maker', 'Image tools', 'PDF tools'],
          keywords: metadata.keywords,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
        ])}
      />
      <Tools />
    </>
  )
}