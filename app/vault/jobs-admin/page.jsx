import JobsAdminBoard from '@/src/views/JobsAdminBoard'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Jobs Admin Control Room',
  description: 'Private admin-only control room for editing Nain CSC jobs, admit cards, results and college form entries.',
  path: '/vault/jobs-admin',
  noIndex: true,
})

export default function JobsAdminPage() {
  return <JobsAdminBoard />
}