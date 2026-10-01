import GrahakVault from '@/src/views/GrahakVault'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Grahak Vault',
  description: 'Private customer records workspace for Nain CSC.',
  path: '/vault',
  noIndex: true,
})

export default function VaultPage() {
  return <GrahakVault />
}