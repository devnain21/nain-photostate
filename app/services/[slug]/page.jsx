import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServiceSlugs } from '@/src/lib/services-data'
import { buildMetadata } from '@/src/lib/seo'
import ServiceDetail from '@/src/views/ServiceDetail'

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}

  return buildMetadata({
    title: service.metaTitle,
    description: service.description,
    path: `/services/${service.slug}`,
    keywords: service.keywords,
  })
}

export default async function ServicePage({ params }) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  return <ServiceDetail service={service} />
}
