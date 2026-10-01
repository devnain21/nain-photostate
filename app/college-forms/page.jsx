import CollegeForms from '@/src/views/CollegeForms'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC College Admission Help in Jind',
  description:
    'Get college admission links, student form support and education service resources from Nain CSC Center in Jind. Students also search this center as Nain Photostate Danoda.',
  path: '/college-forms',
  keywords: ['college forms Jind', 'Nain CSC student services', 'Nain CSC Center', 'student services Danoda Kalan', 'Nain Photostate Danoda'],
})

export default function CollegeFormsPage() {
  return <CollegeForms />
}