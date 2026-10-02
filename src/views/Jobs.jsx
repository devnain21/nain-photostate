"use client"

import React, { useState, useEffect } from 'react'
import '../Styles/jobs.css'
import { getDaysLeft, isNewJobItem, parseDate } from '../lib/job-utils'
import { getJobCategoryContent, hasDeadlineCategory } from '../lib/job-category'
import { fetchJobsBoardData } from '../lib/job-board'

function buildShareText(job) {
  const categoryContent = getJobCategoryContent(job.category)
  const lines = [`📢 *${categoryContent.label} Update*`, '', `📌 *नाम:* ${job.title || 'Update'}`]

  if (job.department) {
    lines.push(`🏢 *विभाग:* ${job.department}`)
  }
  if (job.location) {
    lines.push(`📍 *स्थान:* ${job.location}`)
  }
  if ((categoryContent.key === 'job' || categoryContent.key === 'college') && job.eligibility) {
    lines.push(`🎓 *योग्यता:* ${job.eligibility}`)
  }
  if (categoryContent.key === 'job' && job.posts) {
    lines.push(`👥 *पद:* ${job.posts}`)
  }
  if ((categoryContent.key === 'job' || categoryContent.key === 'college') && job.fees) {
    lines.push(`💰 *फीस:* ₹${job.fees}`)
  }
  if (job.postdate) {
    lines.push(`🗓️ *${categoryContent.postdateLabel}:* ${job.postdate}`)
  }
  if (categoryContent.hasDeadline && job.lastdate) {
    lines.push(`⏳ *${categoryContent.lastdateLabel}:* ${job.lastdate}`)
  }
  if (job.applylink) {
    lines.push(`🔗 *${categoryContent.primaryActionLabel}:* ${job.applylink}`)
  } else if (job.notification) {
    lines.push(`📄 *${categoryContent.noticeActionLabel}:* ${job.notification}`)
  }

  lines.push('', '*ऑनलाइन सहायता के लिए संपर्क करें:*', 'Nain CSC & Online Center', 'Danoda Kalan, Jind', '8950101037')

  return lines.join('\n')
}

function getPrimaryAction(item, categoryContent, isExpired) {
  if (categoryContent.hasDeadline) {
    if (isExpired) {
      return {
        type: 'disabled',
        label: categoryContent.closedActionLabel,
        icon: 'fa-ban',
        className: 'job-btn job-btn-disabled',
      }
    }

    if (item.applylink) {
      return {
        type: 'link',
        href: item.applylink,
        label: categoryContent.primaryActionLabel,
        icon: categoryContent.primaryActionIcon,
        className: 'job-btn job-btn-apply',
      }
    }

    return {
      type: 'disabled',
      label: categoryContent.pendingActionLabel,
      icon: 'fa-clock',
      className: 'job-btn job-btn-soon',
    }
  }

  const href = item.applylink || item.notification
  if (!href) {
    return {
      type: 'disabled',
      label: categoryContent.pendingActionLabel,
      icon: 'fa-clock',
      className: 'job-btn job-btn-soon',
    }
  }

  const usingPrimaryLink = Boolean(item.applylink)
  const variant = categoryContent.key === 'admit'
    ? 'job-btn job-btn-download'
    : categoryContent.key === 'result'
      ? 'job-btn job-btn-result'
      : 'job-btn job-btn-open'

  return {
    type: 'link',
    href,
    label: usingPrimaryLink ? categoryContent.primaryActionLabel : categoryContent.primaryActionFallbackLabel,
    icon: usingPrimaryLink ? categoryContent.primaryActionIcon : 'fa-file-lines',
    className: variant,
  }
}

function buildMetaItems(item, categoryContent, dayBadge) {
  const items = []
  const pushItem = (key, className, icon, label, value, extra) => {
    if (!value) {
      return
    }

    items.push({ key, className, icon, label, value, extra })
  }

  if (categoryContent.key === 'job' || categoryContent.key === 'college') {
    if (item.eligibility) {
      pushItem('eligibility', 'jmeta jmeta-edu', 'fa-graduation-cap', categoryContent.key === 'college' ? 'Course' : 'योग्यता', item.eligibility)
    }
    if (item.fees) {
      pushItem('fees', 'jmeta jmeta-fee', 'fa-rupee-sign', 'फीस', `₹${item.fees}`)
    }
    if (categoryContent.key === 'job' && item.posts) {
      pushItem('posts', 'jmeta jmeta-posts', 'fa-users', 'पद', item.posts)
    }
  }

  if (item.department) {
    pushItem('department', 'jmeta jmeta-department', 'fa-building', 'Dept', item.department)
  }

  if (item.location) {
    pushItem('location', 'jmeta jmeta-location', 'fa-location-dot', 'Place', item.location)
  }

  if (item.postdate) {
    pushItem('postdate', 'jmeta jmeta-release', 'fa-calendar-check', categoryContent.postdateLabel, item.postdate)
  }

  if (categoryContent.hasDeadline) {
    if (item.lastdate) {
      pushItem('lastdate', `jmeta ${dayBadge ? dayBadge.cls : 'jmeta-date'}`, 'fa-hourglass-end', categoryContent.lastdateLabel, item.lastdate, dayBadge?.text)
    } else {
      pushItem('lastdate', 'jmeta jmeta-date', 'fa-hourglass-end', categoryContent.lastdateLabel, 'Update Soon')
    }
  }

  return items
}

const Jobs = () => {
  const [jobsData, setJobsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('job')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [jobsSource, setJobsSource] = useState('database')
  const [boardUpdatedAt, setBoardUpdatedAt] = useState(0)
  const activeCategoryContent = getJobCategoryContent(activeTab)

  const handleTabChange = (tabKey) => {
    const nextCategoryContent = getJobCategoryContent(tabKey)

    if (!nextCategoryContent.hasDeadline && sortBy === 'deadline') {
      setSortBy('latest')
    }

    if (nextCategoryContent.hasDeadline && sortBy === 'published') {
      setSortBy('latest')
    }

    setActiveTab(tabKey)
  }

  useEffect(() => {
    let active = true

    fetchJobsBoardData()
      .then(({ items, source, meta }) => {
        if (!active) {
          return
        }

        setJobsData(items)
        setJobsSource(source)
        setBoardUpdatedAt(Number(meta?.updatedAt) || 0)
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const formatUpdated = (item) => {
    const stamp = jobsSource === 'database'
      ? (Number(item.manualEditedAt) || Number(item.updatedAt) || Number(item.createdAt) || 0)
      : 0

    if (stamp && Number(item.createdAt)) {
      return new Date(stamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return item.postdate || ''
  }

  const boardUpdatedLabel = boardUpdatedAt
    ? new Date(boardUpdatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''

  const shareOnWhatsApp = (job) => {
    const text = buildShareText(job)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const latestJobs = jobsData.filter((job) => job.category?.toLowerCase().includes('job'))
  const admitCards = jobsData.filter((job) => job.category?.toLowerCase().includes('admit'))
  const results = jobsData.filter((job) => job.category?.toLowerCase().includes('result'))
  const collegeForms = jobsData.filter((job) => job.category?.toLowerCase().includes('college'))
  const tabMap = { job: latestJobs, admit: admitCards, result: results, college: collegeForms }

  let currentData = (tabMap[activeTab] || []).filter(item =>
    !searchTerm.trim() ? true :
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.eligibility || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.posts || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  currentData = [...currentData].sort((a, b) => {
    if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'deadline' && activeCategoryContent.hasDeadline) {
      const da = getDaysLeft(a.lastdate) ?? 9999
      const db = getDaysLeft(b.lastdate) ?? 9999
      return da - db
    }
    if (sortBy === 'published') {
      const publishedA = parseDate(a.postdate)?.getTime() || 0
      const publishedB = parseDate(b.postdate)?.getTime() || 0
      return publishedB - publishedA
    }
    return 0
  })

  const tabs = [
    { key: 'job',     label: 'Latest Jobs',   icon: 'fas fa-briefcase',      count: latestJobs.length,   color: '#10b981' },
    { key: 'admit',   label: 'Admit Cards',   icon: 'fas fa-id-card',        count: admitCards.length,   color: '#3b82f6' },
    { key: 'result',  label: 'Results',       icon: 'fas fa-trophy',         count: results.length,      color: '#f59e0b' },
    { key: 'college', label: 'College Forms', icon: 'fas fa-graduation-cap', count: collegeForms.length, color: '#8b5cf6' },
  ]

  const getDayBadge = (daysLeft) => {
    if (daysLeft === null)  return { text: null,             cls: 'jmeta-date'         }
    if (daysLeft < 0)       return { text: 'Expired',        cls: 'jmeta-date expired' }
    if (daysLeft === 0)     return { text: 'Aaj Last Day!',  cls: 'jmeta-date today'   }
    if (daysLeft <= 3)      return { text: `${daysLeft}d Left`, cls: 'jmeta-date urgent' }
    if (daysLeft <= 7)      return { text: `${daysLeft}d Left`, cls: 'jmeta-date soon'   }
    return                         { text: null,              cls: 'jmeta-date'         }
  }

  const SkeletonCard = () => (
    <div className="job-card job-skeleton">
      <div className="sk-line sk-title"></div>
      <div className="sk-line sk-sub"></div>
      <div className="sk-chips">
        <div className="sk-chip"></div>
        <div className="sk-chip"></div>
        <div className="sk-chip"></div>
      </div>
      <div className="sk-line sk-btn"></div>
    </div>
  )

  const urgentJobs = React.useMemo(() => {
    return jobsData.filter((item) => {
      const categoryContent = getJobCategoryContent(item.category)
      if (!categoryContent.hasDeadline || !item.lastdate) return false
      const days = getDaysLeft(item.lastdate)
      return days !== null && days >= 0 && days <= 3
    })
  }, [jobsData])

  return (
    <div className="jobs-page">

      {/* ── Header ── */}
      <div className="jobs-page-header">
        <div className="jph-left">
          <span className="jph-live-dot"></span>
          <div>
            <h1>Live Jobs &amp; Updates</h1>
            <p>सभी सरकारी नौकरी, एडमिट कार्ड और रिजल्ट एक जगह</p>
          </div>
        </div>
        <div className="jph-stats">
          <div className="jph-stat"><strong>{latestJobs.length}</strong><span>Jobs</span></div>
          <div className="jph-stat"><strong>{admitCards.length}</strong><span>Admits</span></div>
          <div className="jph-stat"><strong>{results.length}</strong><span>Results</span></div>
        </div>
      </div>

      {/* ── Urgent Deadline Alert Banner ── */}
      {urgentJobs.length > 0 && (
        <div className="jobs-urgent-alert-bar">
          <div className="urgent-badge">
            <i className="fas fa-hourglass-half"></i> लास्ट डेट अलर्ट
          </div>
          <div className="urgent-content">
            <strong>{urgentJobs.length} फॉर्म्स की अंतिम तिथि निकट है:</strong>{' '}
            <span>{urgentJobs.slice(0, 3).map(j => j.title).join(' • ')}</span>
          </div>
          <button
            type="button"
            className="urgent-action-btn"
            onClick={() => {
              setActiveTab('job')
              setSortBy('deadline')
            }}
          >
            लास्ट डेट अनुसार देखें
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="jobs-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`jobs-tab ${activeTab === t.key ? 'active' : ''}`}
            style={activeTab === t.key ? { '--tab-color': t.color } : {}}
            onClick={() => handleTabChange(t.key)}
          >
            <i className={t.icon}></i>
            <span>{t.label}</span>
            <em>{t.count}</em>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="jobs-toolbar">
        <div className="jobs-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="नाम, विभाग या अपडेट से खोजें..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="jobs-search-clear" onClick={() => setSearchTerm('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="jobs-toolbar-right">
          <select className="jobs-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="latest">Latest</option>
            {activeCategoryContent.hasDeadline ? (
              <option value="deadline">Last Date</option>
            ) : (
              <option value="published">Release Date</option>
            )}
            <option value="name">A–Z</option>
          </select>
        </div>
      </div>

      {/* ── Result count ── */}
      {!loading && (
        <div className="jobs-result-count">
          <span>{currentData.length} result{currentData.length !== 1 ? 's' : ''} found</span>
          {boardUpdatedLabel && <span className="jrc-filter">Last updated {boardUpdatedLabel}</span>}
          {jobsSource === 'sheet' && <span className="jrc-filter">Fallback source active</span>}
          {searchTerm  && <span className="jrc-filter">"{searchTerm}" <button onClick={() => setSearchTerm('')}>✕</button></span>}
        </div>
      )}

      {/* ── Cards ── */}
      <div className="jobs-cards-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : currentData.length === 0 ? (
          <div className="jobs-empty">
            <i className="fas fa-inbox"></i>
            <h3>कोई नतीजा नहीं मिला</h3>
            <p>इस केटेगरी में अभी कोई अपडेट नहीं है</p>
          </div>
        ) : (
          currentData.map((item, index) => {
            const categoryContent = getJobCategoryContent(item.category)
            const hasDeadline = hasDeadlineCategory(item.category)
            const daysLeft   = getDaysLeft(item.lastdate)
            const isExpired  = daysLeft !== null && daysLeft < 0 && hasDeadline && !!item.lastdate
            const isNew      = isNewJobItem(item) && !isExpired
            const endingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && hasDeadline
            const dayBadge   = hasDeadline && item.lastdate ? getDayBadge(daysLeft) : null
            const metaItems = buildMetaItems(item, categoryContent, dayBadge)
            const updatedLabel = formatUpdated(item)
            const primaryAction = getPrimaryAction(item, categoryContent, isExpired)
            const secondaryNoticeHref = item.notification && item.notification !== primaryAction.href ? item.notification : ''

            return (
              <div
                key={index}
                className={`job-card kind-${categoryContent.key}${isExpired ? ' expired' : ''}${endingSoon ? ' ending-soon' : ''}`}
              >
                {/* Top badges */}
                <div className="job-card-top">
                  <div className="job-card-badges">
                    {isNew     && <span className="jbadge jbadge-new"><i className="fas fa-bolt"></i> NEW</span>}
                    {endingSoon && !isExpired && (
                      <span className="jbadge jbadge-urgent">
                        <i className="fas fa-hourglass-half"></i>
                        {daysLeft === 0 ? ' Aaj Last!' : ` ${daysLeft} Din Baki`}
                      </span>
                    )}
                    {isExpired && <span className="jbadge jbadge-expired"><i className="fas fa-lock"></i> Expired</span>}
                  </div>
                  <button className="job-share-icon" onClick={() => shareOnWhatsApp(item)} title="Share on WhatsApp">
                    <i className="fab fa-whatsapp"></i>
                  </button>
                </div>

                {/* Title */}
                <h3 className="job-card-title">{item.title || 'Untitled'}</h3>

                {/* Meta chips */}
                <div className="job-card-meta">
                  {metaItems.map((meta) => (
                    <span className={meta.className} key={meta.key}>
                      <i className={`fas ${meta.icon}`}></i>
                      <span className="jmeta-label">{meta.label}:</span> {meta.value}
                      {meta.extra && <strong className="jdate-status"> {meta.extra}</strong>}
                    </span>
                  ))}
                  {updatedLabel && (
                    <span className="jmeta jmeta-updated">
                      <i className="fas fa-clock"></i>
                      <span className="jmeta-label">Updated:</span> {updatedLabel}
                    </span>
                  )}
                </div>

                {/* Action row */}
                <div className="job-card-actions">
                  {primaryAction.type === 'link' ? (
                    <a href={primaryAction.href} target="_blank" rel="noreferrer" className={primaryAction.className}>
                      <i className={`fas ${primaryAction.icon}`}></i> {primaryAction.label}
                    </a>
                  ) : (
                    <span className={primaryAction.className}>
                      <i className={`fas ${primaryAction.icon}`}></i> {primaryAction.label}
                    </span>
                  )}

                  {secondaryNoticeHref && (
                    <a href={secondaryNoticeHref} target="_blank" rel="noreferrer" className="job-btn job-btn-notice" title="Official Notice / PDF">
                      <i className="fas fa-file-pdf"></i> {categoryContent.noticeActionLabel}
                    </a>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <section className="jobs-seo-panel" aria-labelledby="jobs-seo-title">
        <div className="jobs-seo-copy">
          <span className="jobs-alert-eyebrow">Jobs SEO Hub</span>
          <h2 id="jobs-seo-title">Haryana jobs, admit cards aur college form updates ek jagah</h2>
          <p>
            Yeh page Haryana aur all-India recruitment updates ko ek readable format me dikhata hai. Yahan se HSSC, CET, HKRN, SSC,
            admit card, result aur college admission updates quickly milte hain. Agar aap Danoda Kalan, Jind ya nearby area se hain to
            form filling aur document support bhi yahin se mil sakta hai.
          </p>
        </div>

        <div className="jobs-seo-grid">
          <article>
            <h3>Job seekers ke liye</h3>
            <p>Eligibility, fees, posts aur last date ek hi card me dikhne se application decision fast hota hai.</p>
          </article>
          <article>
            <h3>College aur student updates</h3>
            <p>College forms, scholarship aur admission related entries students ko relevant updates ek hi flow me deti hain.</p>
          </article>
          <article>
            <h3>Local support advantage</h3>
            <p>Official notice ke saath local CSC assistance combine hone se online form filling aur correction ka kaam easy ho jata hai.</p>
          </article>
        </div>
      </section>

    </div>
  )
}

export default Jobs
