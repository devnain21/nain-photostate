'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import FloatingProTools from './FloatingProTools'
import Footer from './Footer'
import Header from './Header'
import MobileQuickActions from './MobileQuickActions'
import Navbar from './Navbar'
import PanchangTicker from './PanchangTicker'

function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function GlobalScrollTop() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300)

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname === '/' || !show) {
    return null
  }

  return (
    <button
      className="scroll-top-btn global-scroll-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  )
}

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isVaultWorkspace = pathname.startsWith('/vault') || pathname.startsWith('/jobs-admin')

  if (isVaultWorkspace) {
    return (
      <div className="main-container main-container-workspace">
        <ScrollToTop />
        <div className="page-transition workspace-transition" key={pathname}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="main-container main-container-site">
      <ScrollToTop />
      <Header />
      <PanchangTicker />
      <Navbar />

      <div className="page-transition" key={pathname}>
        {children}
      </div>

      <Footer />
      <MobileQuickActions />
      <FloatingProTools />
      <GlobalScrollTop />
    </div>
  )
}