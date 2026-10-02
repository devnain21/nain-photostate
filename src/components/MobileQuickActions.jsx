'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { siteConfig } from '../lib/seo'

const phoneHref = `tel:${siteConfig.phone.replace(/\s+/g, '')}`
const subscribeNoop = () => () => {}

const useIsClient = () => useSyncExternalStore(subscribeNoop, () => true, () => false)

const isCurrent = (pathname, href) => {
  const current = pathname.replace(/\/+$/, '') || '/'
  const target = href.replace(/\/+$/, '') || '/'
  return current === target
}

export default function MobileQuickActions() {
  const pathname = usePathname() || '/'
  const mounted = useIsClient()

  if (!mounted) return null

  return createPortal(
    <nav className="mobile-quick-actions" aria-label="Quick actions">
      <Link href="/" className={`mobile-quick-action ${isCurrent(pathname, '/') ? 'is-active' : ''}`}>
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>

      <Link href="/forms" className={`mobile-quick-action ${isCurrent(pathname, '/forms') ? 'is-active' : ''}`}>
        <i className="fas fa-file-pdf"></i>
        <span>Forms</span>
      </Link>

      <Link href="/tools" className={`mobile-quick-action ${isCurrent(pathname, '/tools') ? 'is-active' : ''}`}>
        <i className="fas fa-tools"></i>
        <span>Tools</span>
      </Link>

      <a href={phoneHref} className="mobile-quick-action is-primary">
        <i className="fas fa-phone-alt"></i>
        <span>Call</span>
      </a>
    </nav>,
    document.body,
  )
}
