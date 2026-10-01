import JobsAdminBoard from '@/src/views/JobsAdminBoard'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Jobs Admin Secure Login',
  description: 'Separate private admin login for managing Nain CSC jobs, results, admit cards and college forms.',
  path: '/jobs-admin',
  noIndex: true,
})

export default function JobsAdminPage() {
  return <JobsAdminBoard />
}