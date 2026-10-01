import Privacy from '@/src/views/Privacy'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Privacy Policy | Nain CSC & Online Center',
  description: 'Read the privacy policy for Nain CSC & Online Center, also known as Nain Photostate Danoda, covering website usage and CSC services in Jind.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return <Privacy />
}