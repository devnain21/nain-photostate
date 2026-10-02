import React from 'react'
import Link from 'next/link'

const Footer = () => {
  const quickLinks = [
    { to: '/forms', label: 'Forms' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/tools', label: 'Tools' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/privacy', label: 'Privacy' },
  ]

  return (
    <footer className="footer-links">
      <div className="footer-brand">
        <div className="footer-brand-mark">
          <i className="fas fa-layer-group"></i>
        </div>
        <div>
          <h3>Nain CSC</h3>
          <p>CSC center, photostate and online service desk</p>
        </div>
      </div>

      <nav className="footer-nav" aria-label="Footer links">
        {quickLinks.map((link) => (
          <Link key={link.to} href={link.to} className="footer-nav-link">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="footer-meta-pill">
        <i className="fas fa-shield-check"></i>
        <span>Independent CSC service support</span>
      </div>

      <p className="footer-copy">
        &copy; {new Date().getFullYear()} Nain CSC & Online Center. Design by Dev Nain
        {' • '}
        <Link href="/vault" title="Operator Portal" style={{ opacity: 0.35, fontSize: '11px', textDecoration: 'none' }}>
          <i className="fas fa-lock"></i>
        </Link>
      </p>

      <p className="footer-disclaimer">
        This website is not a government website. CSC and online services are provided independently for public convenience.
      </p>
    </footer>
  )
}

export default Footer
