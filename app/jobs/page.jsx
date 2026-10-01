import Jobs from '@/src/views/Jobs'
import StructuredData from '@/src/components/StructuredData'
import { buildBreadcrumbSchema, buildCollectionPageSchema, buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC Jobs & Sarkari Form Updates in Jind',
  description:
    'Check latest job updates, recruitment links and government form resources through Nain CSC Center for students and job seekers in Jind. This local desk is also searched as Nain Photostate Danoda and Jind CSC.',
  path: '/jobs',
  keywords: ['jobs Jind', 'Nain CSC jobs', 'Nain CSC Center', 'sarkari forms Jind', 'Jind CSC'],
})

export default function JobsPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageSchema({
          title: metadata.title,
          description: metadata.description,
          path: '/jobs',
          about: ['Haryana jobs', 'Admit cards', 'Exam results', 'College admission forms'],
          keywords: metadata.keywords,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Jobs', path: '/jobs' },
        ])}
      />
      <Jobs />
    </>
  )
}