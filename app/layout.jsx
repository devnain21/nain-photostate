import './globals.css'

import { Poppins } from 'next/font/google'
import AppShell from '@/src/components/AppShell'
import StructuredData from '@/src/components/StructuredData'
import { buildOrganizationSchema, siteConfig, withBasePath } from '@/src/lib/seo'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d6efd' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  manifest: withBasePath('/manifest.webmanifest'),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.businessName,
  keywords: siteConfig.keywords,
  authors: [{ name: 'Dev Nain' }],
  creator: 'Dev Nain',
  publisher: siteConfig.businessName,
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  ...(siteConfig.googleSiteVerification
    ? {
        verification: {
          google: siteConfig.googleSiteVerification,
        },
      }
    : {}),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.defaultImage,
        width: 1200,
        height: 630,
        alt: siteConfig.businessName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.defaultImage],
  },
  robots: {
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
  icons: {
    icon: withBasePath('/favicon.ico'),
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','dark');if(document.body){document.body.setAttribute('data-theme','dark');}}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body style={{ '--site-background-image': `url(${withBasePath('/background.jpg')})` }} suppressHydrationWarning>
        <StructuredData data={buildOrganizationSchema()} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}