import LPG from '@/src/views/LPG'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC LPG ID & Gas Service Links',
  description:
    'Find LPG ID related links and gas service helpers from the Nain CSC online tools section in Jind. This service section belongs to Nain CSC Center, also known as Nain Photostate Danoda.',
  path: '/lpg',
  keywords: ['LPG ID tool', 'gas service links', 'Nain CSC LPG', 'Nain CSC Center', 'Nain Photostate Danoda'],
})

export default function LPGPage() {
  return <LPG />
}