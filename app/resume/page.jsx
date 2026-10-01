import ResumeMaker from '@/src/views/ResumeMaker'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC Resume Maker Tool',
  description:
    'Create clean resumes quickly with the Nain CSC resume maker tool for students, job seekers and professionals in Jind. This tool is provided by Nain CSC Center, also known as Nain Photostate Danoda.',
  path: '/resume',
  keywords: ['resume maker tool', 'CV maker Jind', 'Nain CSC resume maker', 'Nain CSC Center', 'Nain Photostate Danoda'],
})

export default function ResumePage() {
  return <ResumeMaker />
}