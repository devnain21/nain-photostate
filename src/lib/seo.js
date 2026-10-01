const FALLBACK_SITE_URL = 'https://naincsc.in'

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.GOOGLE_SITE_VERIFICATION ||
  'eWdhAeWXFKhev9UDklEkuA2BU30mHBiKG14o0HgzAvE'

export const siteBasePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '')

export const siteConfig = {
  businessName: 'Nain CSC & Online Center',
  name: 'Nain CSC & Online Center',
  shortName: 'Nain CSC',
  brandName: 'Nain CSC',
  secondaryBrandName: 'Nain CSC Center',
  localBrandName: 'Nain Photostate Danoda',
  seoTagline: 'Trusted CSC Center in Jind',
  siteUrl: rawSiteUrl.replace(/\/$/, ''),
  googleSiteVerification,
  locale: 'hi_IN',
  defaultImage: '/images/Shop.jpeg',
  description:
    'Nain CSC & Online Center is a trusted CSC center in Danoda Kalan, Jind, Haryana for Family ID, Aadhaar, PAN card, jobs, forms, college admission, pension, LPG and document services. Nain CSC Center is also searched as Nain Photostate Danoda, Jind CSC and Danoda CSC.',
  keywords: [
    'Nain CSC',
    'Nain CSC Center',
    'Nain CSC Jind',
    'Nain CSC Center Jind',
    'Nain CSC Danoda Kalan',
    'Nain Photostate Danoda',
    'Nain Photostate Jind',
    'best CSC center in Jind',
    'trusted CSC center in Jind',
    'CSC center Jind',
    'Jind CSC',
    'CSC Danoda Kalan',
    'Danoda CSC',
    'CSC Jind',
    'online center Danoda Kalan',
    'government forms Jind',
    'Family ID service Jind',
    'Aadhaar update center Jind',
    'job forms Jind',
  ],
  phone: '+91 8950101037',
  email: 'dnain81@gmail.com',
  address: {
    streetAddress: 'Danoda Kalan Road, Sainthali',
    locality: 'Danoda Kalan',
    district: 'Jind',
    region: 'Haryana',
    postalCode: '126152',
    country: 'IN',
    formatted: 'Danoda Kalan Road, Sainthali, Jind, Haryana 126152',
  },
  links: {
    whatsapp: 'https://wa.me/918950101037',
    maps: 'https://maps.app.goo.gl/ZH8JRXH8mjyZdUAf8',
    review: 'https://search.google.com/local/writereview?placeid=ChIJQSgx_hyNETkRQpxNuCUvyeA',
  },
  sameAs: ['https://maps.app.goo.gl/ZH8JRXH8mjyZdUAf8'],
}

export function withBasePath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return siteBasePath ? `${siteBasePath}${normalizedPath}` : normalizedPath
}

export function getAbsoluteUrl(path = '/') {
  return path === '/' ? siteConfig.siteUrl : `${siteConfig.siteUrl}${path}`
}

export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  image = siteConfig.defaultImage,
  noIndex = false,
}) {
  const canonicalUrl = getAbsoluteUrl(path)
  const pageTitle = title || siteConfig.name
  const sharingTitle = pageTitle.includes(siteConfig.shortName) ? pageTitle : `${pageTitle} | ${siteConfig.shortName}`
  const metaDescription = description || siteConfig.description
  const allKeywords = [...new Set([...siteConfig.keywords, ...keywords])]

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: allKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: sharingTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [
        {
          url: getAbsoluteUrl(image),
          width: 1200,
          height: 630,
          alt: siteConfig.businessName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: sharingTitle,
      description: metaDescription,
      images: [getAbsoluteUrl(image)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.siteUrl}/#website`,
        url: siteConfig.siteUrl,
        name: siteConfig.name,
        alternateName: [siteConfig.shortName, siteConfig.secondaryBrandName, siteConfig.localBrandName],
        inLanguage: 'hi-IN',
        description: siteConfig.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.siteUrl}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteConfig.siteUrl}/#organization`,
        name: siteConfig.businessName,
        alternateName: [siteConfig.shortName, siteConfig.secondaryBrandName, siteConfig.localBrandName],
        slogan: `${siteConfig.secondaryBrandName} | ${siteConfig.address.locality}, ${siteConfig.address.district}`,
        url: siteConfig.siteUrl,
        logo: getAbsoluteUrl('/images/Shop.jpeg'),
        telephone: siteConfig.phone,
        email: siteConfig.email,
        sameAs: siteConfig.sameAs,
        keywords: siteConfig.keywords.join(', '),
        founder: {
          '@type': 'Person',
          name: 'Dev Nain',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            telephone: siteConfig.phone,
            email: siteConfig.email,
            url: siteConfig.links.whatsapp,
            availableLanguage: ['Hindi', 'English'],
            areaServed: ['Danoda Kalan', 'Jind', 'Haryana'],
          },
        ],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteConfig.siteUrl}/#localbusiness`,
        name: siteConfig.businessName,
        alternateName: [siteConfig.shortName, siteConfig.secondaryBrandName, siteConfig.localBrandName],
        slogan: `${siteConfig.secondaryBrandName} | ${siteConfig.address.locality}, ${siteConfig.address.district}`,
        image: getAbsoluteUrl('/images/Shop.jpeg'),
        url: siteConfig.siteUrl,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        sameAs: siteConfig.sameAs,
        hasMap: siteConfig.links.maps,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address.streetAddress,
          addressLocality: siteConfig.address.locality,
          addressRegion: siteConfig.address.region,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            telephone: siteConfig.phone,
            email: siteConfig.email,
            url: siteConfig.links.whatsapp,
            availableLanguage: ['Hindi', 'English'],
          },
        ],
        areaServed: ['Danoda Kalan', 'Sainthali', 'Jind', 'Haryana'],
        knowsAbout: [
          'Family ID service',
          'Aadhaar assistance',
          'PAN card help',
          'Job forms',
          'College forms',
          'Pension services',
          'LPG services',
          'Photostate and printout',
        ],
        department: [
          {
            '@type': 'GovernmentOffice',
            name: 'CSC and Online Forms Desk',
          },
          {
            '@type': 'CopyShop',
            name: 'Photostate and Printout Desk',
          },
        ],
        founder: {
          '@type': 'Person',
          name: 'Dev Nain',
        },
        description: siteConfig.description,
        keywords: siteConfig.keywords.join(', '),
      },
    ],
  }
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  }
}

export function buildCollectionPageSchema({ title, description, path, about = [], keywords = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: getAbsoluteUrl(path),
    isPartOf: {
      '@id': `${siteConfig.siteUrl}/#website`,
    },
    about: about.map((item) => ({
      '@type': 'Thing',
      name: item,
    })),
    keywords: keywords.join(', '),
  }
}

export const homeFaqs = [
  {
    question: 'Nain CSC par kaun kaun si CSC services milti hain?',
    answer:
      'Nain CSC par Family ID, Aadhaar, PAN card, Ayushman card, job forms, college admission, pension, scholarship, ration card aur kai online CSC services ek hi jagah milti hain. Local users ise Nain CSC Center aur Nain Photostate Danoda ke naam se bhi search karte hain.',
  },
  {
    question: 'Kya Nain CSC Danoda Kalan aur Jind ke aas paas ke logon ke liye local center hai?',
    answer:
      'Haan, Nain CSC Danoda Kalan, Jind aur nearby villages ke customers ke liye local CSC, photostate aur online document help center ke roop me kaam karta hai. Isko Nain CSC Center aur Nain Photostate Danoda ke naam se bhi jaana jata hai.',
  },
  {
    question: 'Yahan job aur college form bharwane ki service milti hai?',
    answer:
      'Haan, Nain CSC par sarkari job forms, HKRN, HSSC, CET, scholarship aur college admission forms ke liye support diya jata hai.',
  },
  {
    question: 'Customer ko contact karne ka sabse fast tarika kya hai?',
    answer:
      'Call ya WhatsApp par +91 8950101037 par direct contact kiya ja sakta hai. Contact page par map aur review links bhi available hain.',
  },
]

