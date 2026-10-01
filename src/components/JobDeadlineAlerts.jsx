'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { withBasePath } from '@/src/lib/seo'
import { JOBS_SHEET_URL, buildJobNotificationPayload, buildJobReminderSummary, parseJobsCsv } from '@/src/lib/job-utils'

const STORAGE_KEY = 'vaultJobAlertSignature'

export default function JobDeadlineAlerts() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState(
    () => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'),
  )

  useEffect(() => {
    let active = true

    fetch(JOBS_SHEET_URL)
      .then((response) => response.text())
      .then((csvText) => {
        if (!active) {
          return
        }

        setJobs(parseJobsCsv(csvText))
        setLoading(false)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setJobs([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const summary = buildJobReminderSummary(jobs)

  const showBrowserNotification = useCallback((force = false) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const payload = buildJobNotificationPayload(summary)
    if (!payload) {
      return
    }

    const previousSignature = localStorage.getItem(STORAGE_KEY)
    if (!force && previousSignature === payload.signature) {
      return
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: withBasePath('/favicon.ico'),
      tag: 'nain-job-alert',
    })

    notification.onclick = () => {
      window.focus()
      window.location.href = withBasePath('/jobs')
    }

    localStorage.setItem(STORAGE_KEY, payload.signature)
  }, [summary])

  useEffect(() => {
    showBrowserNotification(false)
  }, [showBrowserNotification])

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      showBrowserNotification(true)
    }
  }

  return (
    <section className="vault-alert-panel" aria-labelledby="vault-alert-title">
      <div className="vault-alert-top">
        <div>
          <span className="vault-alert-eyebrow">Private Update Monitor</span>
          <h2 id="vault-alert-title">Jobs aur forms ki pending update reminders</h2>
          <p>
            Expired dates, missing last dates, aur incomplete entries yahan dikhenge. Is panel ka kaam hai aapko batana ki
            kis update par action lena hai.
          </p>
        </div>

        <button
          type="button"
          className="vault-alert-notify-btn"
          onClick={enableNotifications}
          disabled={notificationPermission === 'denied'}
        >
          <i className="fas fa-bell"></i>
          {notificationPermission === 'granted'
            ? 'Browser alerts on'
            : notificationPermission === 'denied'
              ? 'Alerts blocked'
              : 'Enable alerts'}
        </button>
      </div>

      <div className="vault-alert-stats">
        <div className="vault-alert-stat critical">
          <strong>{summary.expired.length}</strong>
          <span>Expired</span>
        </div>
        <div className="vault-alert-stat warning">
          <strong>{summary.today.length}</strong>
          <span>Today</span>
        </div>
        <div className="vault-alert-stat soon">
          <strong>{summary.endingSoon.length}</strong>
          <span>3 Days</span>
        </div>
        <div className="vault-alert-stat neutral">
          <strong>{summary.missingDeadline.length}</strong>
          <span>Missing Date</span>
        </div>
      </div>

      {loading ? (
        <div className="vault-alert-empty">Jobs alerts load ho rahe hain...</div>
      ) : summary.needsUpdateItems.length === 0 ? (
        <div className="vault-alert-empty success">Abhi koi urgent jobs update pending nahi hai.</div>
      ) : (
        <div className="vault-alert-list">
          {summary.needsUpdateItems.slice(0, 6).map((entry) => (
            <article className="vault-alert-item" key={`${entry.item.title}-${entry.item.lastdate || 'na'}`}>
              <div className="vault-alert-item-copy">
                <h3>{entry.item.title}</h3>
                <p>{entry.reasons.join(' • ')}</p>
              </div>
              <div className="vault-alert-item-meta">
                <span>{entry.item.lastdate || 'Date missing'}</span>
                {entry.item.notification ? (
                  <a href={entry.item.notification} target="_blank" rel="noreferrer">
                    Notice
                  </a>
                ) : (
                  <span className="vault-alert-missing-link">Notice add karein</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="vault-alert-footer">
        <span>Public page dekhkar verify karein aur source sheet/update link me correction karein.</span>
        <Link href="/jobs">Jobs page kholo</Link>
      </div>
    </section>
  )
}