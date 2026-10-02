"use client"

import React, { useEffect, useRef, useState } from 'react'
import { withBasePath } from '../lib/seo'

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const isThemeInitialized = useRef(false)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-theme') === 'dark' ||
        localStorage.getItem('theme') === 'dark'

      setIsDarkMode(Boolean(isDark))
      isThemeInitialized.current = true
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (!isThemeInitialized.current) {
      return
    }

    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.body.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  return (
    <>
      <header className="ultra-pro-header">
          <div className="uph-left">
              <div className="uph-logo-wrapper">
              <img src={withBasePath('/images/Shop.jpeg')} alt="Nain CSC Logo" className="uph-logo" />
                  <div className="uph-logo-ring"></div>
              </div>
              
              <div className="uph-brand-info">
                  <h1 className="uph-title">
                NAIN CSC <span className="uph-accent">& ONLINE CENTER</span>
                  </h1>
                  <p className="uph-tagline">"हर ऑनलाइन काम, अब और भी आसान।"</p>
              </div>
          </div>

          <div className="uph-right">
              <div className="uph-owner-group">
                  <div className="uph-chip owner-chip">
                      <i className="fas fa-user-shield"></i> Dev Nain
                  </div>
                  
                  <button 
                    type="button"
                    className="theme-toggle-btn" 
                    onClick={() => setIsDarkMode((prev) => !prev)}
                    title="Toggle Dark Mode"
                    aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
                    aria-pressed={isDarkMode}
                  >
                    {isDarkMode ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
                  </button>
              </div>

              <a href="tel:8950101037" className="uph-chip contact-chip">
                  <i className="fas fa-headset"></i> +91 8950101037
              </a>
          </div>
      </header>
    </>
  )
}

export default Header