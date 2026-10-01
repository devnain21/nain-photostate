import { hasDeadlineCategory } from './job-category'

export const JOBS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOjRuYWhQGvJeQWT4w6knLknfSR7431Ord6IzBCrcchJQwDusOZmKevQ_FFncp5jQZ9cuQ0MAjW1V4/pub?gid=0&single=true&output=csv'

const DAY_MS = 86400000

const MONTH_MAP = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
}

const SEVERITY_ORDER = {
  missing: 5,
  expired: 4,
  today: 3,
  soon: 2,
  notice: 1,
  link: 1,
}

export function parseJobsCsv(csvText) {
  const rows = csvText.split('\n').filter((row) => row.trim() !== '')

  if (!rows.length) {
    return []
  }

  const headers = rows[0].split(',').map((header) => header.trim().toLowerCase())

  return rows.slice(1).map((row) => {
    const values = row
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((value) => value.replace(/^"|"$/g, '').trim())

    const item = {}
    headers.forEach((header, index) => {
      item[header] = values[index] || ''
    })
    return item
  })
}

export function parseDate(dateString) {
  if (!dateString || !dateString.trim()) {
    return null
  }

  const value = dateString.trim()
  let match = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (match) {
    const date = new Date(+match[3], +match[2] - 1, +match[1])
    return Number.isNaN(date.getTime()) ? null : date
  }

  match = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2})$/)
  if (match) {
    const date = new Date(2000 + +match[3], +match[2] - 1, +match[1])
    return Number.isNaN(date.getTime()) ? null : date
  }

  match = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
  if (match) {
    const date = new Date(+match[1], +match[2] - 1, +match[3])
    return Number.isNaN(date.getTime()) ? null : date
  }

  match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (match) {
    const month = MONTH_MAP[match[2].toLowerCase()]
    if (month !== undefined) {
      const date = new Date(+match[3], month, +match[1])
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/)
  if (match) {
    const month = MONTH_MAP[match[1].toLowerCase()]
    if (month !== undefined) {
      const date = new Date(+match[3], month, +match[2])
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  const fallback = new Date(value)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function getDaysLeft(dateString) {
  const date = parseDate(dateString)
  if (!date) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date - today) / DAY_MS)
}

export function isNewJobItem(item) {
  if (!item?.postdate) {
    return false
  }

  const postDate = parseDate(item.postdate)
  if (!postDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  postDate.setHours(0, 0, 0, 0)
  return Math.ceil((today - postDate) / DAY_MS) <= 3
}

function buildReminderReason(item, daysLeft) {
  if (!item.lastdate) {
    return { key: 'missing', label: 'Last date missing' }
  }
  if (daysLeft !== null && daysLeft < 0) {
    return { key: 'expired', label: 'Last date expired' }
  }
  if (daysLeft === 0) {
    return { key: 'today', label: 'Today is last date' }
  }
  if (daysLeft !== null && daysLeft <= 3) {
    return { key: 'soon', label: `${daysLeft} day left` }
  }
  return null
}

export function buildJobReminderSummary(jobs = []) {
  const deadlineJobs = jobs.filter(hasDeadlineCategory)
  const expired = []
  const today = []
  const endingSoon = []
  const thisWeek = []
  const missingDeadline = []
  const updateMap = new Map()

  deadlineJobs.forEach((item) => {
    const daysLeft = getDaysLeft(item.lastdate)
    const reminder = buildReminderReason(item, daysLeft)

    if (!item.lastdate) {
      missingDeadline.push(item)
    } else if (daysLeft !== null && daysLeft < 0) {
      expired.push(item)
    } else if (daysLeft === 0) {
      today.push(item)
    } else if (daysLeft !== null && daysLeft <= 3) {
      endingSoon.push(item)
    } else if (daysLeft !== null && daysLeft <= 7) {
      thisWeek.push(item)
    }

    const updateEntry = updateMap.get(item.title) || {
      item,
      daysLeft,
      reasons: [],
      severity: 0,
    }

    if (reminder) {
      updateEntry.reasons.push(reminder.label)
      updateEntry.severity = Math.max(updateEntry.severity, SEVERITY_ORDER[reminder.key] || 0)
    }

    if (!item.applylink) {
      updateEntry.reasons.push('Apply link missing')
      updateEntry.severity = Math.max(updateEntry.severity, SEVERITY_ORDER.link)
    }

    if (!item.notification) {
      updateEntry.reasons.push('Official notice missing')
      updateEntry.severity = Math.max(updateEntry.severity, SEVERITY_ORDER.notice)
    }

    if (updateEntry.reasons.length) {
      updateEntry.reasons = Array.from(new Set(updateEntry.reasons))
      updateMap.set(item.title, updateEntry)
    }
  })

  const needsUpdateItems = Array.from(updateMap.values()).sort((left, right) => {
    if (right.severity !== left.severity) {
      return right.severity - left.severity
    }

    const leftDays = left.daysLeft ?? 9999
    const rightDays = right.daysLeft ?? 9999
    return leftDays - rightDays
  })

  return {
    total: deadlineJobs.length,
    expired,
    today,
    endingSoon,
    thisWeek,
    missingDeadline,
    needsUpdateItems,
  }
}

export function buildJobNotificationPayload(summary) {
  const criticalCount = summary.expired.length + summary.today.length + summary.missingDeadline.length
  if (!criticalCount) {
    return null
  }

  const bodyParts = []
  if (summary.expired.length) {
    bodyParts.push(`${summary.expired.length} expired`)
  }
  if (summary.today.length) {
    bodyParts.push(`${summary.today.length} ending today`)
  }
  if (summary.missingDeadline.length) {
    bodyParts.push(`${summary.missingDeadline.length} missing last date`)
  }

  const headline = summary.needsUpdateItems
    .slice(0, 2)
    .map((entry) => entry.item.title)
    .join(', ')

  return {
    title: 'Jobs update reminder',
    body: headline ? `${bodyParts.join(' • ')}. Check: ${headline}` : bodyParts.join(' • '),
    signature: `${bodyParts.join('|')}::${headline}`,
  }
}