"use client"

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsMounted(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return undefined
    }

    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMounted, isOpen])

  const normalizePath = (path = '/') => (path.length > 1 ? path.replace(/\/+$/, '') : path)
  const isActive = (path) => (normalizePath(pathname) === normalizePath(path) ? 'active' : '')
  const toggleMenu = () => setIsOpen((prev) => !prev)

  return (
    <>
      <div className="smart-bar">
        <button type="button" className="hamburger" onClick={toggleMenu} aria-label="Open menu">
          <i className="fas fa-bars"></i>
        </button>

        <div className="bar-menu">
            <Link href="/" className={`nav-btn ${isActive('/')}`}>Home</Link>
            <Link href="/forms" className={`nav-btn ${isActive('/forms')}`}>Forms</Link>
            <Link href="/jobs" className={`nav-btn ${isActive('/jobs')}`}>Jobs</Link>
            <Link href="/tools" className={`nav-btn ${isActive('/tools')}`}>Tools</Link>
            <Link href="/college-forms" className={`nav-btn ${isActive('/college-forms')}`}>College</Link>
            <Link href="/about" className={`nav-btn ${isActive('/about')}`}>About</Link>
            <Link href="/contact" className={`nav-btn ${isActive('/contact')}`}>Contact</Link>
        </div>

        <div className="bar-actions">
            <a className="bar-khata" href="https://hisabdesk.netlify.app/" target="_blank" rel="noopener noreferrer" aria-label="KhataBook" title="KhataBook">
                <svg className="khata-mark" viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill="#0f6b4c" />
                    <rect x="7" y="5" width="18" height="22" rx="2" fill="#ffffff" />
                    <rect x="7" y="5" width="3.2" height="22" fill="#e11d48" />
                    <path d="M14 10.5h8M14 14.2h8M14 17.9h8" stroke="#e5e7eb" strokeWidth="1.3" strokeLinecap="round" />
                    <text x="18.2" y="20.6" textAnchor="middle" fill="#0f6b4c" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">₹</text>
                </svg>
                KhataBook
            </a>
            <a className="bar-wa-link" href="https://chat.whatsapp.com/JTO6kT4j8ykEIgRAVdpags?mode=hqrc" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i> Join
            </a>
        </div>
      </div>

      {isMounted
        ? createPortal(
        <>
          {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
          <div className="sidenav" style={{ width: isOpen ? '280px' : '0' }}>
            <button type="button" className="closebtn" onClick={toggleMenu} aria-label="Close menu">&times;</button>
            
            <div style={{padding: '0 25px 20px 25px', borderBottom: '2px solid #0d6efd', marginBottom: '10px'}}>
                <h2 style={{margin:0, color:'#0d6efd'}}>Nain CSC</h2>
                <p style={{margin:0, fontSize:'12px', color:'#666'}}>Menu</p>
            </div>

            <Link href="/" onClick={toggleMenu}><i className="fas fa-home"></i> Home</Link>
            <Link href="/forms" onClick={toggleMenu}><i className="fas fa-file-download"></i> Forms</Link>
            <Link href="/jobs" onClick={toggleMenu}><i className="fas fa-briefcase"></i> Jobs</Link>
            <Link href="/tools" onClick={toggleMenu}><i className="fas fa-tools"></i> Tools</Link>
            <a href="https://hisabdesk.netlify.app/" target="_blank" rel="noopener noreferrer" onClick={toggleMenu}><i className="fas fa-book"></i> KhataBook</a>
            <Link href="/college-forms" onClick={toggleMenu}><i className="fas fa-graduation-cap"></i> College Forms</Link>
            <Link href="/lpg" onClick={toggleMenu}><i className="fas fa-fire"></i> LPG Services</Link>
            <Link href="/resume" onClick={toggleMenu}><i className="fas fa-file-invoice"></i> Resume Maker</Link>
            <Link href="/about" onClick={toggleMenu}><i className="fas fa-info-circle"></i> About</Link>
            <Link href="/contact" onClick={toggleMenu}><i className="fas fa-envelope"></i> Contact</Link>
          </div>
        </>,
        document.body
      ) : null}
    </>
  )
}

export default Navbar