import AgeCalculator from '@/src/views/AgeCalculator'
import { buildMetadata } from '@/src/lib/seo'

export const metadata = buildMetadata({
  title: 'Nain CSC Age Calculator Tool',
  description:
    'Calculate exact age quickly with the Nain CSC age calculator tool for forms, admissions and document work in Jind. The tool belongs to Nain CSC Center, also searched as Nain Photostate Danoda.',
  path: '/age-calculator',
  keywords: ['age calculator', 'age calculator for forms', 'Nain CSC tools', 'Nain CSC Center', 'Nain Photostate Danoda'],
})

export default function AgeCalculatorPage() {
  return <AgeCalculator />
}