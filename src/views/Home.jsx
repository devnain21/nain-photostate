"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import MenuGrid from '../components/MenuGrid'
import VanillaTilt from 'vanilla-tilt'
import { onAuthStateChanged } from 'firebase/auth'
import { get, ref, update } from 'firebase/database'
import { auth, db } from '../firebase'
import { homeFaqs, siteBasePath, siteConfig, withBasePath } from '../lib/seo'
import '../Styles/home.css'
import { buildSearchableServices, findServiceMatches } from '../lib/home-search'

const serviceClickKey = (value = '') => {
  const raw = String(value || '').trim()
  if (!raw) return ''

  let path = raw.split('?')[0]
  try {
    path = new URL(raw, 'https://naincsc.in').pathname
  } catch {
    path = raw.split('?')[0]
  }

  if (siteBasePath && path.startsWith(siteBasePath)) {
    path = path.slice(siteBasePath.length) || '/'
  }

  if (path.length > 1) {
    path = path.replace(/\/+$/, '')
  }

  return path || '/'
}

const normalizeClickMap = (saved) => {
  const normalized = {}

  Object.entries(saved || {}).forEach(([key, count]) => {
    const clickKey = serviceClickKey(key)
    const clicks = Number(count) || 0
    if (!clickKey || clicks <= 0) return
    normalized[clickKey] = (normalized[clickKey] || 0) + clicks
  })

  return normalized
}

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const clickStoreListeners = new Set()
let clickSnapshot = '{}'

const emitClickStore = () => {
  clickStoreListeners.forEach((listener) => listener())
}

const getClickSnapshot = () => {
  const next = localStorage.getItem('serviceClicks') || '{}'
  if (next !== clickSnapshot) clickSnapshot = next
  return clickSnapshot
}

const subscribeClicks = (listener) => {
  clickStoreListeners.add(listener)
  const refresh = () => listener()
  window.addEventListener('pageshow', refresh)
  window.addEventListener('focus', refresh)
  return () => {
    clickStoreListeners.delete(listener)
    window.removeEventListener('pageshow', refresh)
    window.removeEventListener('focus', refresh)
  }
}

const saveServiceClicks = (clicks) => {
  localStorage.setItem('serviceClicks', JSON.stringify(clicks))
  emitClickStore()
}

const seoHighlights = [
  {
    title: 'Local CSC aur online help',
    text: 'Danoda Kalan, Jind aur nearby villages ke liye ek hi jagah par forms, IDs, jobs aur daily digital services available hain.',
  },
  {
    title: 'Government form support',
    text: 'Family ID, Aadhaar, PAN, pension, scholarship, college admission, HKRN, CET aur kai official portals ki fast assistance milti hai.',
  },
  {
    title: 'Document to delivery workflow',
    text: 'Photostate, printout, online submission, document correction aur follow-up support ek smooth local service flow me handle hota hai.',
  },
]

const Home = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('top')
  const [recentSearches, setRecentSearches] = useState([])

  const clickSnapshot = useSyncExternalStore(subscribeClicks, getClickSnapshot, () => '{}')
  const clickData = useMemo(() => {
    try {
      return normalizeClickMap(JSON.parse(clickSnapshot))
    } catch {
      return {}
    }
  }, [clickSnapshot])

  const [showScrollTop, setShowScrollTop] = useState(false)
  const [tabKey, setTabKey] = useState(0)
  const [confirmedSearch, setConfirmedSearch] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showServiceManager, setShowServiceManager] = useState(false)
  const [visibleServiceIds, setVisibleServiceIds] = useState([])
  const [prefsReady, setPrefsReady] = useState(false)
  const [preferenceScopeLabel, setPreferenceScopeLabel] = useState('this device only')

  const glassPanelRef = useRef(null)
  const searchInputRef = useRef(null)
  const suggestionBoxRef = useRef(null)

  useEffect(() => {
    setRecentSearches(readStorage('recentServiceSearches', []))
    const clicks = normalizeClickMap(readStorage('serviceClicks', {}))
    const serialized = JSON.stringify(clicks)
    if ((localStorage.getItem('serviceClicks') || '{}') !== serialized) {
      saveServiceClicks(clicks)
    }
  }, [])

  useEffect(() => {
    const panel = glassPanelRef.current

    if (panel) {
      VanillaTilt.init(panel, {
        max: 2,
        speed: 400,
        glare: true,
        'max-glare': 0.08,
        perspective: 1500,
      })
    }

    return () => {
      if (panel && panel.vanillaTilt) {
        panel.vanillaTilt.destroy()
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(e.target) && e.target !== searchInputRef.current) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateSearchUrl = useCallback((value) => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('search', value)
    } else {
      url.searchParams.delete('search')
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`
    router.replace(nextUrl, { scroll: false })
  }, [router])

  const syncSearchFromUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const urlSearch = new URLSearchParams(window.location.search).get('search')?.trim() || ''

    if (!urlSearch) {
      setSearchTerm('')
      setConfirmedSearch('')
      return
    }

    setSearchTerm((previous) => (previous === urlSearch ? previous : urlSearch))
    setConfirmedSearch((previous) => (previous === urlSearch ? previous : urlSearch))
    setActiveTab('all')
  }, [])

  useEffect(() => {
    syncSearchFromUrl()
    window.addEventListener('popstate', syncSearchFromUrl)

    return () => {
      window.removeEventListener('popstate', syncSearchFromUrl)
    }
  }, [syncSearchFromUrl])

  const services = useMemo(() => [
    { title: 'Family ID', icon: 'fas fa-users', url: '/services/family-id', external: false, category: 'id' },
    { title: 'Ayushman card', icon: 'fas fa-heartbeat', url: '/services/ayushman-card', external: false, category: 'id' },
    { title: 'Saral Haryana', icon: 'fas fa-laptop-house', url: '/services/saral-haryana', external: false, category: 'utility' },
    { title: 'Digital Seva (CSC)', icon: 'fas fa-globe', url: '/services/digital-seva-csc', external: false, category: 'utility' },
    {
      title: 'जनगणना',
      icon: 'fas fa-clipboard-list',
      url: '/services/janganna',
      external: false,
      category: 'utility',
      isNew: true,
      searchTags: ['janganna', 'jangana', 'jan ganana', 'census', 'digital census', 'self enumeration', 'se id', 'house listing'],
    },
    { title: 'Aadhar Card', icon: 'fas fa-fingerprint', url: '/services/aadhaar-card', external: false, category: 'id' },
    { title: 'Ration Card', icon: 'fas fa-utensils', url: '/services/ration-card', external: false, category: 'id' },
    { title: 'Jamabandi', icon: 'fas fa-map-marked-alt', url: '/services/jamabandi', external: false, category: 'kisan' },
    { title: 'College Forms', icon: 'fas fa-graduation-cap', url: '/college-forms', external: false, category: 'student' },
    { title: 'Farmer ID', icon: 'fas fa-leaf', url: '/services/farmer-id', external: false, category: 'kisan' },
    {
      title: 'Mera Pariwar',
      icon: 'fas fa-house-user',
      url: '/services/mera-pariwar',
      external: false,
      category: 'id',
      isNew: true,
      searchTags: ['mera pariwar', 'mera parivar', 'meraparivar', 'family id update', 'ppp update', 'forgot family id', 'parivar pehchan patra', 'family id status'],
    },
    { title: 'Sarathi Parivahan', icon: 'fa-solid fa-bus', url: '/services/sarathi-parivahan', external: false, category: 'utility' },
    { title: 'e-Disha Status', icon: 'fas fa-file-contract', url: '/services/edisha-status', external: false, category: 'utility' },
    { title: 'Panjikaran', icon: 'fas fa-seedling', url: '/services/panjikaran', external: false, category: 'kisan' },
    { title: 'SC / BC Welfare', icon: 'fa-solid fa-people-arrows', url: '/services/sc-bc-welfare', external: false, category: 'welfare' },
    { title: 'PM Kisan Portal', icon: 'fas fa-tractor', url: '/services/pm-kisan', external: false, category: 'kisan' },
    { title: 'Agri Haryana', icon: 'fas fa-leaf', url: '/services/agri-haryana', external: false, category: 'kisan' },
    { title: 'Labour Copy', icon: 'fas fa-hard-hat', url: '/services/labour-card', external: false, category: 'welfare' },
    { title: 'Vote Card', icon: 'fas fa-vote-yea', url: '/services/voter-id', external: false, category: 'id' },
    { title: 'PAN Card (NSDL)', icon: 'fas fa-id-card', url: '/services/pan-card', external: false, category: 'id' },
    { title: 'Passport', icon: 'fas fa-passport', url: '/services/passport', external: false, category: 'id' },
    { title: 'Pension Status', icon: 'fas fa-blind', url: '/services/pension-status', external: false, category: 'welfare' },
    { title: 'Pension List', icon: 'fa-solid fa-list-check', url: '/services/pension-list', external: false, category: 'welfare' },
    { title: 'Marriage Registration', icon: 'fa-solid fa-children', url: '/services/marriage-registration', external: false, category: 'welfare' },
    { title: 'HKRN', icon: 'fas fa-network-wired', url: '/services/hkrn', external: false, category: 'student' },
    { title: 'Saksham Yojana', icon: 'fas fa-chalkboard-teacher', url: '/services/saksham-yojana', external: false, category: 'student' },
    { title: 'Employment Exchange', icon: 'fas fa-handshake', url: '/services/employment-exchange', external: false, category: 'student' },
    { title: 'HBSE Board', icon: 'fas fa-book-reader', url: '/services/hbse-board', external: false, category: 'student' },
    { title: 'Ujjwala Yojana', icon: 'fas fa-burn', url: '/services/ujjwala-yojana', external: false, category: 'welfare' },
    { title: 'Deen Dayal', icon: 'fas fa-home', url: '/services/deen-dayal', external: false, category: 'welfare' },
    { title: 'College Admission', icon: 'fas fa-user-graduate', url: '/services/college-admission', external: false, category: 'student' },
    { title: 'DHBVN Apply', icon: 'fas fa-bolt', url: '/services/dhbvn-apply', external: false, category: 'utility' },
    { title: 'DHBVN Login', icon: 'fas fa-plug', url: '/services/dhbvn-login', external: false, category: 'utility' },
    { title: 'Police Verification', icon: 'fas fa-shield-alt', url: '/services/police-verification', external: false, category: 'utility' },
    { title: 'PF Apply / KYC', icon: 'fas fa-piggy-bank', url: '/services/pf-epfo', external: false, category: 'utility' },
    { title: 'Aadhaar–PAN Link', icon: 'fas fa-link', url: '/services/aadhaar-pan-link', external: false, category: 'id' },
    { title: 'UDID Card', icon: 'fas fa-wheelchair', url: '/services/udid-card', external: false, category: 'id' },
    { title: 'CEIR Complaint', icon: 'fas fa-mobile-alt', url: '/services/ceir-complaint', external: false, category: 'utility' },
    { title: 'Har Chhatravrati', icon: 'fas fa-graduation-cap', url: '/services/har-chhatravratti', external: false, category: 'student' },
    { title: 'NCC Enrollment', icon: 'fas fa-medal', url: '/services/ncc-enrollment', external: false, category: 'student' },
    { title: 'HSSC / CET Haryana', icon: 'fas fa-briefcase', url: '/services/hssc-cet', external: false, category: 'student' },
    { title: 'SSC Portal (New)', icon: 'fas fa-laptop-code', url: '/services/ssc-portal', external: false, category: 'student' },
    { title: 'NSP Scholarship', icon: 'fas fa-university', url: '/services/nsp-scholarship', external: false, category: 'student' },
    { title: 'E-Shram Card', icon: 'fas fa-id-card-clip', url: '/services/e-shram-card', external: false, category: 'welfare' },
    { title: 'Fasal Bima (PMFBY)', icon: 'fas fa-cloud-sun-rain', url: '/services/fasal-bima', external: false, category: 'kisan' },
    { title: 'PM Surya Ghar (Solar)', icon: 'fas fa-solar-panel', url: '/services/pm-surya-ghar', external: false, category: 'utility' },
    { title: 'Apprenticeship', icon: 'fas fa-tools', url: '/services/apprenticeship', external: false, category: 'student' },
    { title: 'Bijli Bill Pay', icon: 'fas fa-file-invoice-dollar', url: '/services/bijli-bill-pay', external: false, category: 'utility' },
    { title: 'Ration Details', icon: 'fas fa-list-alt', url: '/services/ration-details', external: false, category: 'id' },
    { title: 'Photo Maker', icon: 'fas fa-camera', url: 'https://www.photopea.com/', external: true, category: 'tools' },
    { title: 'All Card Maker', icon: 'fas fa-print', url: 'https://idcard.store/u/all_cards', external: true, category: 'tools' },
    { title: 'CD Service', icon: 'fas fa-city', url: '/services/cd-service', external: false, category: 'utility' },
    { title: 'WhatsApp Web', icon: 'fab fa-whatsapp', url: 'https://web.whatsapp.com/', external: true, category: 'tools' },
    { title: 'Traffic Challan', icon: 'fas fa-receipt', url: '/services/traffic-challan', external: false, category: 'utility' },
    { title: 'Know LPG ID', icon: 'fas fa-fire', url: '/lpg', external: false, category: 'tools' },
    { title: 'Resume Maker', icon: 'fas fa-file-invoice', url: '/resume', external: false, category: 'tools' },
    { title: 'Property ID (NDC)', icon: 'fas fa-building', url: '/services/property-id-ndc', external: false, category: 'utility' },
    { title: 'Haryana Rodways Pass', icon: 'fas fa-bus-alt', url: '/services/haryana-roadways-pass', external: false, category: 'student' },
    { title: 'E-Kharid (Gate Pass)', icon: 'fas fa-truck-pickup', url: '/services/e-kharid-gate-pass', external: false, category: 'kisan', isNew: true },
    { title: 'PM Maandhan', icon: 'fas fa-rupee-sign', url: '/services/pm-maandhan', external: false, category: 'welfare', isNew: true },
    { title: 'HSRP Number Plate', icon: 'fas fa-car', url: '/services/hsrp-number-plate', external: false, category: 'utility', isNew: true },
    { title: 'DBT / PFMS Status', icon: 'fas fa-money-check-alt', url: '/services/dbt-pfms-status', external: false, category: 'welfare', isNew: true },
    { title: 'Udyam (MSME) Certificate', icon: 'fas fa-store', url: '/services/udyam-msme', external: false, category: 'utility', isNew: true },
  ], [])

  const getServiceId = (service) => service.url || service.title
  const allServiceIds = useMemo(() => services.map(getServiceId), [services])

  const sanitizeVisibleIds = useCallback((ids) => {
    if (!Array.isArray(ids)) return allServiceIds
    const sanitized = ids.filter((id) => allServiceIds.includes(id))
    return sanitized.length || ids.length === 0 ? sanitized : allServiceIds
  }, [allServiceIds])

  useEffect(() => {
    const guestStorageKey = 'homeServicePrefs_guest'

    const loadGuestPreferences = () => {
      try {
        const saved = localStorage.getItem(guestStorageKey)
        return saved ? sanitizeVisibleIds(JSON.parse(saved)) : allServiceIds
      } catch {
        return allServiceIds
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setPrefsReady(false)

      try {
        if (user) {
          setPreferenceScopeLabel(user.email || 'your account')
          const prefsRef = ref(db, `home_service_preferences/${user.uid}`)
          const snapshot = await get(prefsRef)

          if (snapshot.exists()) {
            setVisibleServiceIds(sanitizeVisibleIds(snapshot.val()?.visibleServices))
          } else {
            const guestPrefs = loadGuestPreferences()
            setVisibleServiceIds(guestPrefs)
            await update(prefsRef, {
              visibleServices: guestPrefs,
              updatedAt: Date.now(),
              email: user.email || null,
            })
          }
        } else {
          setPreferenceScopeLabel('this device only')
          setVisibleServiceIds(loadGuestPreferences())
        }
      } catch (error) {
        console.error('Could not load home service preferences:', error)
        setVisibleServiceIds(allServiceIds)
      } finally {
        setPrefsReady(true)
      }
    })

    return () => unsubscribe()
  }, [allServiceIds, sanitizeVisibleIds])

  const saveVisibleServices = async (nextIds) => {
    const sanitizedIds = Array.from(new Set(nextIds)).filter((id) => allServiceIds.includes(id))
    setVisibleServiceIds(sanitizedIds)
    setTabKey((prev) => prev + 1)

    try {
      if (auth.currentUser) {
        await update(ref(db, `home_service_preferences/${auth.currentUser.uid}`), {
          visibleServices: sanitizedIds,
          updatedAt: Date.now(),
          email: auth.currentUser.email || null,
        })
        setPreferenceScopeLabel(auth.currentUser.email || 'your account')
      } else {
        localStorage.setItem('homeServicePrefs_guest', JSON.stringify(sanitizedIds))
        setPreferenceScopeLabel('this device only')
      }
    } catch (error) {
      console.error('Could not save home service preferences:', error)
      localStorage.setItem('homeServicePrefs_guest', JSON.stringify(sanitizedIds))
    }
  }

  const toggleServiceVisibility = (serviceId) => {
    const nextIds = visibleServiceIds.includes(serviceId)
      ? visibleServiceIds.filter((id) => id !== serviceId)
      : [...visibleServiceIds, serviceId]

    saveVisibleServices(nextIds)
  }

  const showAllServices = () => {
    saveVisibleServices(allServiceIds)
    setActiveTab('all')
    setConfirmedSearch('')
    setSearchTerm('')
  }

  const hideAllServices = () => {
    saveVisibleServices([])
    setActiveTab('all')
    setConfirmedSearch('')
    setSearchTerm('')
  }

  const effectiveVisibleIds = prefsReady ? visibleServiceIds : allServiceIds
  const personalizedServices = services.filter((service) => effectiveVisibleIds.includes(getServiceId(service)))

  const toggleAllServices = () => {
    if (effectiveVisibleIds.length === services.length) {
      hideAllServices()
    } else {
      showAllServices()
    }
  }

  const categoryCounts = {
    all: personalizedServices.length,
    top: Math.min(12, personalizedServices.length),
    id: personalizedServices.filter((s) => s.category === 'id').length,
    kisan: personalizedServices.filter((s) => s.category === 'kisan').length,
    student: personalizedServices.filter((s) => s.category === 'student').length,
    welfare: personalizedServices.filter((s) => s.category === 'welfare').length,
    utility: personalizedServices.filter((s) => s.category === 'utility').length,
  }

  const recordServiceClick = (url) => {
    const clickKey = serviceClickKey(url)
    if (!clickKey) return

    const previous = normalizeClickMap(readStorage('serviceClicks', {}))
    const next = {
      ...previous,
      [clickKey]: (Number(previous[clickKey]) || 0) + 1,
    }
    saveServiceClicks(next)
  }

  const handleLinkClick = (e) => {
    const linkElement = e.target.closest('a')

    if (linkElement) {
      const href = linkElement.getAttribute('href')
      if (!href) return

      recordServiceClick(href)

      if (href.startsWith('http')) {
        e.preventDefault()
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const openService = (item) => {
    recordServiceClick(item.url)

    if (item.external) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      return
    }

    router.push(item.url)
  }

  const saveRecentSearch = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const next = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6)
    setRecentSearches(next)
    localStorage.setItem('recentServiceSearches', JSON.stringify(next))
  }

  const runSearch = (value) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setConfirmedSearch('')
      setShowSuggestions(false)
      updateSearchUrl('')
      return
    }

    saveRecentSearch(trimmed)
    setConfirmedSearch(trimmed)
    setActiveTab('all')
    setShowSuggestions(false)
    setSelectedSuggestion(-1)
    updateSearchUrl(trimmed)
  }

  const searchablePersonalizedServices = useMemo(
    () => buildSearchableServices(personalizedServices),
    [personalizedServices],
  )

  const suggestedServices = searchTerm.trim()
    ? findServiceMatches(searchablePersonalizedServices, searchTerm).slice(0, 6)
    : []

  let displayServices = []

  if (activeTab === 'all') {
    displayServices = personalizedServices
  } else if (activeTab === 'top') {
    displayServices = [...personalizedServices].sort((a, b) => {
      const clicksA = clickData[serviceClickKey(a.url)] || 0
      const clicksB = clickData[serviceClickKey(b.url)] || 0
      return clicksB - clicksA
    }).slice(0, 12)
  } else {
    displayServices = personalizedServices.filter((service) => service.category === activeTab)
  }

  if (confirmedSearch) {
    displayServices = findServiceMatches(buildSearchableServices(displayServices), confirmedSearch)
  }

  const hiddenCount = services.length - personalizedServices.length
  const noVisibleServices = personalizedServices.length === 0
  const whatsappUrl = siteConfig.links.whatsapp
  const mapsUrl = siteConfig.links.maps
  const reviewUrl = siteConfig.links.review
  const trustStats = [
    { value: `${services.length}+`, label: 'service flows listed' },
    { value: siteConfig.address.locality, label: 'local support desk' },
    { value: 'Direct', label: 'call and WhatsApp help' },
  ]
  const trustSignals = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Easy to find and visit',
      text: 'Google Maps par listed location se shop tak direct route mil jata hai.',
    },
    {
      icon: 'fas fa-headset',
      title: 'Direct support before you come',
      text: 'Call ya WhatsApp par pehle hi documents aur process clear kiye ja sakte hain.',
    },
    {
      icon: 'fas fa-star',
      title: 'Public trust touchpoints',
      text: 'Google review link aur contact page dono visible rakhkar brand ko more credible banaya gaya hai.',
    },
  ]

  return (
    <div className="page home">
      <div className="home-search-block">
        <div className="pro-search-section home-search-section">
          <div className="pro-search-wrapper">
            <i className="fas fa-search pro-search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="pro-search-input"
              placeholder='Search any service... (Press "/" to focus)'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSelectedSuggestion(-1)
                setShowSuggestions(true)
                if (e.target.value.trim() !== '') {
                  setActiveTab('all')
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSelectedSuggestion((prev) => (prev < suggestedServices.length - 1 ? prev + 1 : 0))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : suggestedServices.length - 1))
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  if (selectedSuggestion >= 0 && suggestedServices[selectedSuggestion]) {
                    const item = suggestedServices[selectedSuggestion]
                    setSearchTerm(item.title)
                    setConfirmedSearch(item.title)
                    saveRecentSearch(item.title)
                    setActiveTab('all')
                    setShowSuggestions(false)
                    setSelectedSuggestion(-1)
                    openService(item)
                  } else {
                    runSearch(searchTerm)
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false)
                  setSelectedSuggestion(-1)
                  searchInputRef.current?.blur()
                }
              }}
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('')
                  setConfirmedSearch('')
                  updateSearchUrl('')
                }}
                title="Clear"
              >
                <i className="fas fa-times"></i>
              </button>
            )}

            <button className="search-action-btn" onClick={() => runSearch(searchTerm)}>
              <i className="fas fa-arrow-right"></i>
            </button>

            {suggestedServices.length > 0 && showSuggestions && (
              <div className="search-suggestion-box" ref={suggestionBoxRef}>
                {suggestedServices.map((item, index) => (
                  <button
                    key={item.url}
                    className={`search-suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
                    onClick={() => {
                      setSearchTerm(item.title)
                      setConfirmedSearch(item.title)
                      saveRecentSearch(item.title)
                      setActiveTab('all')
                      setShowSuggestions(false)
                      setSelectedSuggestion(-1)
                      openService(item)
                    }}
                    onMouseEnter={() => setSelectedSuggestion(index)}
                  >
                    <i className={item.icon}></i>
                    <div className="search-suggestion-copy">
                      <span>{item.title}</span>
                      <small>{item.matchLabel}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {recentSearches.length > 0 && !searchTerm && (
          <div className="recent-search-row">
            <span>Recent:</span>
            {recentSearches.map((item) => (
              <button
                key={item}
                className="recent-search-chip"
                onClick={() => {
                  setSearchTerm(item)
                  runSearch(item)
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="home-tabs-wrapper">
        <button
          className={`home-mini-menu-btn ${showServiceManager ? 'active' : ''}`}
          onClick={() => setShowServiceManager((prev) => !prev)}
          title={`Services • ${personalizedServices.length} shown • ${hiddenCount} hidden • ${preferenceScopeLabel}`}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>

        {[
          { key: 'top', label: '⭐ Most Used' },
          { key: 'all', label: '🌐 All' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`home-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.key)
              setTabKey((k) => k + 1)
            }}
          >
            {tab.label} <span className="home-tab-count">{categoryCounts[tab.key]}</span>
          </button>
        ))}

        <button className="view-toggle-btn" onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))} title={viewMode === 'grid' ? 'List View' : 'Grid View'}>
          <i className={viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th'}></i>
          <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
        </button>
      </div>

      {showServiceManager && (
        <div className="service-popup-overlay" onClick={() => setShowServiceManager(false)}>
          <div className="service-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="service-popup-top">
              <button type="button" className="service-popup-bulk-btn" onClick={toggleAllServices}>
                <i className={`fas ${effectiveVisibleIds.length === services.length ? 'fa-square-minus' : 'fa-square-check'}`}></i>
                <span>{effectiveVisibleIds.length === services.length ? 'None' : 'All'}</span>
              </button>

              <button
                type="button"
                className="service-popup-close"
                onClick={() => setShowServiceManager(false)}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="service-popup-grid">
              {services.map((service) => {
                const serviceId = getServiceId(service)
                const checked = effectiveVisibleIds.includes(serviceId)

                return (
                  <button
                    key={serviceId}
                    type="button"
                    className={`service-popup-tile ${checked ? 'active' : ''}`}
                    onClick={() => toggleServiceVisibility(serviceId)}
                    title={service.title}
                  >
                    <i className={service.icon}></i>
                    <span>{service.title}</span>
                    <small className="service-popup-check">
                      <i className={`fas ${checked ? 'fa-check-circle' : 'fa-circle'}`}></i>
                    </small>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div
        ref={glassPanelRef}
        className="gemini-glass-card home-grid-shell"
        onClickCapture={handleLinkClick}
      >
        <div className="home-grid-animated" key={tabKey}>
          <MenuGrid items={displayServices} viewMode={viewMode} />
        </div>
      </div>

      {displayServices.length === 0 && (
        <div className="home-empty-state">
          <i className={`fas ${noVisibleServices ? 'fa-eye-slash' : 'fa-search'}`}></i>
          <h3>{noVisibleServices ? 'Abhi koi service selected nahi hai' : 'कोई सर्विस नहीं मिली'}</h3>
          <p>
            {noVisibleServices
              ? 'Aapne फिलहाल सारी services hide कर दी हैं। "Sab Dikhao" दबाते ही सब वापस दिख जाएँगी।'
              : `"${confirmedSearch || searchTerm}" से कोई रिजल्ट नहीं आया। कुछ और खोजें।`}
          </p>
          <button
            className="home-empty-btn"
            onClick={() => {
              if (noVisibleServices) {
                showAllServices()
              } else {
                setSearchTerm('')
                setConfirmedSearch('')
                setActiveTab('all')
              }
            }}
          >
            {noVisibleServices ? 'सब services वापस दिखाएँ' : 'सभी सर्विसेज देखें'}
          </button>
        </div>
      )}

      <section className="home-trust-section" aria-labelledby="home-trust-title">
        <div className="home-trust-card">
          <div className="home-trust-visual">
            <div className="home-trust-image-frame">
              <img src={withBasePath('/images/Shop.jpeg')} alt="Nain CSC brand mark" className="home-trust-image" />
              <div className="home-trust-stamp">
                <span className="home-trust-stamp-dot"></span>
                Trusted local support desk
              </div>
            </div>

            <div className="home-trust-owner">
              <img src={withBasePath('/images/Photo.jpg')} alt="Dev Nain" className="home-trust-owner-photo" />
              <div className="home-trust-owner-copy">
                <strong>Direct support by Dev Nain</strong>
                <span>Call, WhatsApp, ya visit se form help aur document guidance mil sakti hai.</span>
              </div>
            </div>
          </div>

          <div className="home-trust-copy">
            <span className="home-seo-eyebrow"><i className="fas fa-shield-alt"></i> Trusted Local Center</span>
            <h2 id="home-trust-title">Danoda Kalan me online forms, IDs, printout aur local digital help ek hi jagah</h2>
            <p>
              Nain CSC ka home page ab sirf service grid nahi, balki ek proper trust-first landing experience bhi hai.
              Yahan se users directly samajh sakte hain ki shop kaha hai, kis se baat karni hai, aur kis channel se fastest help milegi.
            </p>

            <div className="home-trust-stats">
              {trustStats.map((item) => (
                <article key={item.label} className="home-trust-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>

            <div className="home-trust-grid">
              {trustSignals.map((item) => (
                <article key={item.title} className="home-trust-point">
                  <div className="home-trust-point-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="home-trust-actions">
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="home-trust-btn primary">
                <i className="fas fa-phone-volume"></i>
                Call now
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="home-trust-btn secondary">
                <i className="fab fa-whatsapp"></i>
                WhatsApp
              </a>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="home-trust-btn secondary">
                <i className="fas fa-map-marker-alt"></i>
                Visit shop
              </a>
              <a href={reviewUrl} target="_blank" rel="noreferrer" className="home-trust-link">
                Google review link
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-seo-section" aria-labelledby="home-seo-title">
        <div className="home-seo-card">
          <span className="home-seo-eyebrow">Nain CSC Center Services</span>
          <h2 id="home-seo-title">Danoda Kalan ka trusted Nain CSC center, photostate aur online service desk</h2>
          <p>
            Nain CSC & Online Center local customers ko fast digital help deta hai. Yahan se government forms,
            Family ID, Aadhaar related work, PAN card, job updates, college forms, LPG links aur daily document services
            easily access ki ja sakti hain.
          </p>
          <p>
            Google par Nain CSC, Nain CSC Center, Nain Photostate Danoda, Jind CSC ya form filling service search karne wale
            users ko business name, location aur core services ek saath clearly milen, isliye yeh section brand aur local
            intent ko directly explain karta hai.
          </p>

          <div className="home-seo-grid">
            {seoHighlights.map((item) => (
              <article key={item.title} className="home-seo-point">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-faq-section" aria-labelledby="home-faq-title">
        <div className="home-faq-card">
          <span className="home-seo-eyebrow">FAQs</span>
          <h2 id="home-faq-title">Nain CSC ke bare me common sawal</h2>
          <div className="home-faq-list">
            {homeFaqs.map((item) => (
              <article key={item.question} className="home-faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </div>
  )
}

export default Home