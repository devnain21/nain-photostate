import MyResume from '@/src/views/MyResume'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'My Resume',
  description: 'Private resume preview page.',
  path: '/my-resume',
  noIndex: true,
})

export default function MyResumePage() {
  return <MyResume />
}