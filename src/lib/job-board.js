import { get, ref, set } from 'firebase/database'
import { db } from '../firebase'
import { JOBS_SHEET_URL, getDaysLeft, isNewJobItem, parseDate, parseJobsCsv } from './job-utils'

const JOBS_ITEMS_PATH = 'public_job_board/items'
const JOBS_META_PATH = 'public_job_board/meta'
const SYNC_COMPARE_FIELDS = [
  'title',
  'category',
  'eligibility',
  'fees',
  'posts',
  'postdate',
  'lastdate',
  'applylink',
  'notification',
  'department',
  'location',
  'note',
]

function cleanValue(value = '') {
  return String(value || '').trim()
}

function normalizeKeySegment(value = '') {
  return cleanValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function createJobId(title = '', index = 0) {
  const base = cleanValue(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `job-${index + 1}`

  return `job-${base}-${index + 1}`
}

export function buildJobImportKey(record = {}) {
  const category = normalizeKeySegment(record.category || 'job') || 'job'
  const title = normalizeKeySegment(record.title)
  const department = normalizeKeySegment(record.department)
  const applyLink = normalizeKeySegment(record.applylink)
  const noticeLink = normalizeKeySegment(record.notification)

  if (title) {
    return [category, title, department || 'general'].join('::')
  }

  if (applyLink) {
    return `apply::${applyLink}`
  }

  if (noticeLink) {
    return `notice::${noticeLink}`
  }

  return `${category}::untitled`
}

function getFreshnessTime(record = {}) {
  const postDate = parseDate(record.postdate)?.getTime() || 0
  const createdAt = Number(record.createdAt) || 0
  const updatedAt = Number(record.updatedAt) || 0
  const manualEditedAt = Number(record.manualEditedAt) || 0
  return Math.max(postDate, createdAt, updatedAt, manualEditedAt)
}

function getDeadlineTime(record = {}) {
  const deadline = parseDate(record.lastdate)
  return deadline ? deadline.getTime() : Number.MAX_SAFE_INTEGER
}

function getSortBucket(record = {}) {
  const daysLeft = getDaysLeft(record.lastdate)

  if (daysLeft !== null && daysLeft < 0) {
    return 5
  }

  if (isNewJobItem(record)) {
    return 0
  }

  if (daysLeft === 0) {
    return 1
  }

  if (daysLeft !== null && daysLeft <= 3) {
    return 2
  }

  if (daysLeft === null) {
    return 4
  }

  return 3
}

function areSyncFieldsDifferent(existingRecord = {}, importedRecord = {}) {
  return SYNC_COMPARE_FIELDS.some((field) => cleanValue(existingRecord[field]) !== cleanValue(importedRecord[field]))
}

export function normalizeJobRecord(record = {}) {
  return {
    id: cleanValue(record.id),
    title: cleanValue(record.title),
    category: cleanValue(record.category) || 'job',
    eligibility: cleanValue(record.eligibility),
    fees: cleanValue(record.fees),
    posts: cleanValue(record.posts),
    postdate: cleanValue(record.postdate),
    lastdate: cleanValue(record.lastdate),
    applylink: cleanValue(record.applylink),
    notification: cleanValue(record.notification),
    department: cleanValue(record.department),
    location: cleanValue(record.location),
    note: cleanValue(record.note),
    importKey: cleanValue(record.importKey) || buildJobImportKey(record),
    createdAt: Number(record.createdAt) || Number(record.updatedAt) || 0,
    updatedAt: Number(record.updatedAt) || Date.now(),
    updatedBy: cleanValue(record.updatedBy),
    manualEditedAt: Number(record.manualEditedAt) || 0,
    lastImportedAt: Number(record.lastImportedAt) || 0,
    preserveOnImport: Boolean(record.preserveOnImport),
  }
}

function sortJobs(items) {
  return [...items].sort((left, right) => {
    const leftBucket = getSortBucket(left)
    const rightBucket = getSortBucket(right)

    if (leftBucket !== rightBucket) {
      return leftBucket - rightBucket
    }

    if (leftBucket === 5) {
      const expiredDiff = getDeadlineTime(right) - getDeadlineTime(left)
      if (expiredDiff !== 0) {
        return expiredDiff
      }
    } else if (leftBucket === 0 || leftBucket === 4) {
      const freshnessDiff = getFreshnessTime(right) - getFreshnessTime(left)
      if (freshnessDiff !== 0) {
        return freshnessDiff
      }
    } else {
      const deadlineDiff = getDeadlineTime(left) - getDeadlineTime(right)
      if (deadlineDiff !== 0) {
        return deadlineDiff
      }

      const freshnessDiff = getFreshnessTime(right) - getFreshnessTime(left)
      if (freshnessDiff !== 0) {
        return freshnessDiff
      }
    }

    return left.title.localeCompare(right.title)
  })
}

function snapshotToJobs(value) {
  if (!value || typeof value !== 'object') {
    return []
  }

  return sortJobs(
    Object.entries(value).map(([id, item]) => normalizeJobRecord({ id, ...item })),
  )
}

export function createEmptyJobRecord() {
  return {
    id: '',
    title: '',
    category: 'job',
    eligibility: '',
    fees: '',
    posts: '',
    postdate: '',
    lastdate: '',
    applylink: '',
    notification: '',
    department: '',
    location: '',
    note: '',
  }
}

export function buildJobsBoardSummary(items = []) {
  const expired = items.filter((item) => {
    const daysLeft = getDaysLeft(item.lastdate)
    return daysLeft !== null && daysLeft < 0
  })

  const endingSoon = items.filter((item) => {
    const daysLeft = getDaysLeft(item.lastdate)
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3
  })

  const live = items.filter((item) => {
    const daysLeft = getDaysLeft(item.lastdate)
    return daysLeft === null || daysLeft >= 0
  })

  const withNotice = items.filter((item) => item.notification)

  return {
    total: items.length,
    live: live.length,
    expired: expired.length,
    endingSoon: endingSoon.length,
    withNotice: withNotice.length,
  }
}

export async function fetchJobsBoardData(database = db) {
  try {
    const snapshot = await get(ref(database, JOBS_ITEMS_PATH))
    const items = snapshotToJobs(snapshot.val())

    if (items.length) {
      const metaSnapshot = await get(ref(database, JOBS_META_PATH))
      return {
        items,
        meta: metaSnapshot.val() || null,
        source: 'database',
      }
    }
  } catch {
    // Ignore and fall back to sheet.
  }

  const csvText = await fetch(JOBS_SHEET_URL).then((response) => response.text())
  const items = sortJobs(
    parseJobsCsv(csvText).map((item, index) => normalizeJobRecord({
      id: `sheet-${createJobId(item.title, index)}`,
      ...item,
    })),
  )

  return {
    items,
    meta: null,
    source: 'sheet',
  }
}

export async function fetchJobsSheetSeed() {
  const csvText = await fetch(JOBS_SHEET_URL).then((response) => response.text())

  return sortJobs(
    parseJobsCsv(csvText).map((item, index) => normalizeJobRecord({
      id: `sheet-${createJobId(item.title, index)}`,
      importKey: buildJobImportKey(item),
      lastImportedAt: Date.now(),
      ...item,
    })),
  )
}

export function mergeImportedJobs(existingItems = [], importedItems = []) {
  const importedAt = Date.now()
  const existingByKey = new Map()
  const mergedItems = []
  const stats = {
    added: 0,
    updated: 0,
    preserved: 0,
    retained: 0,
  }

  existingItems.forEach((item, index) => {
    const normalized = normalizeJobRecord(item)
    const key = normalized.importKey || buildJobImportKey(normalized) || `existing-${normalized.id || index}`

    if (!existingByKey.has(key)) {
      existingByKey.set(key, normalized)
    }
  })

  importedItems.forEach((item, index) => {
    const normalizedImport = normalizeJobRecord({
      ...item,
      importKey: buildJobImportKey(item),
      lastImportedAt: importedAt,
    })
    const importKey = normalizedImport.importKey || `import-${index}`
    const existing = existingByKey.get(importKey)

    if (!existing) {
      mergedItems.push({
        ...normalizedImport,
        createdAt: normalizedImport.createdAt || importedAt,
        lastImportedAt: importedAt,
      })
      stats.added += 1
      return
    }

    existingByKey.delete(importKey)

    const shouldPreserveExisting = Boolean(
      existing.preserveOnImport ||
      existing.manualEditedAt ||
      areSyncFieldsDifferent(existing, normalizedImport),
    )

    if (shouldPreserveExisting) {
      mergedItems.push({
        ...existing,
        importKey,
        lastImportedAt: importedAt,
        preserveOnImport: true,
      })
      stats.preserved += 1
      return
    }

    mergedItems.push({
      ...normalizedImport,
      id: existing.id,
      createdAt: existing.createdAt || normalizedImport.createdAt || importedAt,
      manualEditedAt: 0,
      lastImportedAt: importedAt,
      preserveOnImport: false,
    })
    stats.updated += 1
  })

  existingByKey.forEach((item) => {
    mergedItems.push(item)
    stats.retained += 1
  })

  return {
    items: sortJobs(mergedItems),
    stats,
  }
}

export async function saveJobsBoard(items, adminEmail, database = db) {
  const payload = {}
  const savedAt = Date.now()

  items.forEach((item, index) => {
    const normalized = normalizeJobRecord(item)
    const id = normalized.id && !normalized.id.startsWith('sheet-')
      ? normalized.id
      : createJobId(normalized.title, index)

    const { id: _id, ...record } = normalized
    payload[id] = {
      ...record,
      importKey: record.importKey || buildJobImportKey(normalized),
      createdAt: record.createdAt || savedAt,
      updatedAt: savedAt,
      lastImportedAt: record.lastImportedAt || 0,
      manualEditedAt: record.manualEditedAt || 0,
      preserveOnImport: Boolean(record.preserveOnImport),
      updatedBy: cleanValue(adminEmail),
    }
  })

  await set(ref(database, JOBS_ITEMS_PATH), payload)
  const meta = {
    updatedAt: savedAt,
    updatedBy: cleanValue(adminEmail),
    count: Object.keys(payload).length,
  }
  await set(ref(database, JOBS_META_PATH), meta)

  return {
    items: snapshotToJobs(payload),
    meta,
    source: 'database',
  }
}