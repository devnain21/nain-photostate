    import { getAbsoluteUrl, siteConfig } from '@/src/lib/seo'
    import { getAllServiceSlugs } from '@/src/lib/services-data'

    export const dynamic = 'force-static'

const SITEMAP_ROUTES = [
  {
    path: '/',
    changeFrequency: 'daily',
    priority: 1,
    images: [siteConfig.defaultImage],
  },
  {
    path: '/jobs',
    changeFrequency: 'daily',
    priority: 0.95,
  },
  {
    path: '/forms',
    changeFrequency: 'weekly',
    priority: 0.95,
  },
  {
    path: '/contact',
    changeFrequency: 'monthly',
    priority: 0.9,
    images: [siteConfig.defaultImage],
  },
  {
    path: '/tools',
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.8,
    images: [siteConfig.defaultImage],
  },
  {
    path: '/college-forms',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/resume',
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/age-calculator',
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/lpg',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/privacy',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
]

function getDefaultLastModified() {
  return new Date(process.env.VERCEL_GIT_COMMIT_DATE || Date.now())
}

export default function sitemap() {
  const defaultLastModified = getDefaultLastModified()

  const staticRoutes = SITEMAP_ROUTES.map((route) => ({
    url: getAbsoluteUrl(route.path),
    lastModified: route.lastModified ? new Date(route.lastModified) : defaultLastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.images
      ? {
          images: route.images.map((imagePath) => getAbsoluteUrl(imagePath)),
        }
      : {}),
  }))

  const serviceRoutes = getAllServiceSlugs().map((slug) => ({
    url: getAbsoluteUrl(`/services/${slug}`),
    lastModified: defaultLastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes]
}