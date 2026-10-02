'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  EmailAuthProvider,
  browserSessionPersistence,
  onAuthStateChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth'
import { adminAuth, adminDb, hasAdminBackendConfig } from '../firebase'
import {
  clearJobsAdminFailures,
  formatLockoutRemaining,
  getAdminEmail,
  getJobsAdminLockState,
  isJobsAdminCredentialError,
  isAdminEmail,
  registerJobsAdminFailure,
} from '../lib/admin-auth'
import {
  createEmptyJobRecord,
  fetchJobsBoardData,
  fetchJobsSheetSeed,
  mergeImportedJobs,
  saveJobsBoard,
} from '../lib/job-board'
import { getDaysLeft, isNewJobItem } from '../lib/job-utils'
import { getJobCategoryContent, getJobCategoryKey, shouldShowCategoryField } from '../lib/job-category'
import JobDeadlineAlerts from '../components/JobDeadlineAlerts'
import '../Styles/jobs-admin.css'

function formatMetaDate(timestamp) {
  if (!timestamp) {
    return 'Not saved yet'
  }

  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusMeta(job) {
  const categoryContent = getJobCategoryContent(job.category)

  if (!categoryContent.hasDeadline) {
    if (isNewJobItem(job)) {
      return { label: 'Fresh', tone: 'fresh' }
    }
    if (job.postdate) {
      return { label: categoryContent.postdateLabel, tone: 'live' }
    }
    if (job.applylink || job.notification) {
      return { label: 'Updated', tone: 'live' }
    }
    return { label: 'Info', tone: 'missing' }
  }

  const daysLeft = getDaysLeft(job.lastdate)

  if (!job.lastdate) {
    return { label: 'Missing date', tone: 'missing' }
  }
  if (daysLeft !== null && daysLeft < 0) {
    return { label: 'Expired', tone: 'expired' }
  }
  if (daysLeft === 0) {
    return { label: 'Today', tone: 'today' }
  }
  if (daysLeft !== null && daysLeft <= 3) {
    return { label: `${daysLeft} day left`, tone: 'soon' }
  }
  return { label: 'Live', tone: 'live' }
}

const CATEGORY_ORDER = ['job', 'admit', 'result', 'college', 'other']

const CATEGORY_META = {
  all: { label: 'All entries', icon: 'fa-layer-group', color: '#334155' },
  job: { label: 'Latest Jobs', icon: 'fa-briefcase', color: '#10b981' },
  admit: { label: 'Admit Cards', icon: 'fa-id-card', color: '#3b82f6' },
  result: { label: 'Results', icon: 'fa-trophy', color: '#f59e0b' },
  college: { label: 'College Forms', icon: 'fa-graduation-cap', color: '#8b5cf6' },
  other: { label: 'Other updates', icon: 'fa-folder-open', color: '#64748b' },
}

function humanizeCategoryLabel(value = '') {
  const normalized = String(value || '')
    .replace(/[-_]+/g, ' ')
    .trim()

  if (!normalized) {
    return 'Other updates'
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getCategoryKey(value = '') {
  return getJobCategoryKey(value)
}

function getCategoryMeta(key = 'other') {
  return CATEGORY_META[key] || {
    label: humanizeCategoryLabel(key),
    icon: 'fa-folder-open',
    color: '#64748b',
  }
}

function getEditorGuide(categoryValue = 'job') {
  const categoryContent = getJobCategoryContent(categoryValue)

  if (categoryContent.key === 'admit') {
    return 'Admit cards me release date, download link aur exam notice rakhein. Last date yahan zaroori nahi hoti.'
  }
  if (categoryContent.key === 'result') {
    return 'Results me declared date, result link aur official notice rakhein. Apply fields yahan use nahi hote.'
  }
  if (categoryContent.key === 'college') {
    return 'College forms ke liye eligibility, fees, opening aur closing date sabse important hote hain.'
  }

  return 'Jobs ke liye eligibility, posts, fees, last date aur working apply link sabse important hote hain.'
}

function getFieldConfigForCategory(field, categoryValue) {
  const categoryContent = getJobCategoryContent(categoryValue)
  const overrides = {
    eligibility: {
      label: categoryContent.key === 'college' ? 'Course / Eligibility' : 'Eligibility',
    },
    postdate: {
      label: categoryContent.postdateLabel || field.label,
    },
    lastdate: {
      label: categoryContent.lastdateLabel || field.label,
    },
    applylink: {
      label: categoryContent.primaryLinkLabel,
    },
    notification: {
      label: categoryContent.noticeLabel,
    },
  }

  return {
    ...field,
    ...(overrides[field.key] || {}),
  }
}

function shouldRenderEditorField(fieldKey, categoryValue) {
  if (fieldKey === 'title' || fieldKey === 'category') {
    return true
  }

  return shouldShowCategoryField(categoryValue, fieldKey)
}

function getAdminSummary(job) {
  const categoryContent = getJobCategoryContent(job.category)

  if (categoryContent.key === 'job' || categoryContent.key === 'college') {
    return job.eligibility || job.department || categoryContent.descriptionFallback
  }

  return [job.department, job.location, job.note].filter(Boolean).join(' • ') || categoryContent.descriptionFallback
}

function buildAdminMetaItems(job) {
  const categoryContent = getJobCategoryContent(job.category)
  const items = []

  if (categoryContent.hasDeadline) {
    items.push({ label: categoryContent.lastdateLabel, value: job.lastdate || 'Missing' })
  } else {
    items.push({ label: categoryContent.postdateLabel, value: job.postdate || 'Missing' })
  }

  if (categoryContent.key === 'job' && job.posts) {
    items.push({ label: 'Posts', value: job.posts })
  }

  if ((categoryContent.key === 'job' || categoryContent.key === 'college') && job.fees) {
    items.push({ label: 'Fees', value: job.fees })
  }

  if (job.department) {
    items.push({ label: 'Dept', value: job.department })
  }

  if (job.location) {
    items.push({ label: 'Place', value: job.location })
  }

  items.push({
    label: categoryContent.primaryLinkShortLabel,
    value: job.applylink ? 'Added' : 'Missing',
  })

  items.push({ label: 'Notice', value: job.notification ? 'Added' : 'Missing' })

  return items.slice(0, 5)
}

function sortFilteredJobs(items = [], sortMode = 'smart') {
  if (sortMode === 'smart') {
    return items
  }

  const nextItems = [...items]

  if (sortMode === 'recent') {
    return nextItems.sort(
      (left, right) => (Number(right.manualEditedAt) || Number(right.updatedAt) || 0) - (Number(left.manualEditedAt) || Number(left.updatedAt) || 0),
    )
  }

  if (sortMode === 'deadline') {
    return nextItems.sort((left, right) => {
      const leftValue = getDaysLeft(left.lastdate)
      const rightValue = getDaysLeft(right.lastdate)
      const normalizedLeft = leftValue === null ? Number.MAX_SAFE_INTEGER : leftValue
      const normalizedRight = rightValue === null ? Number.MAX_SAFE_INTEGER : rightValue

      if (normalizedLeft !== normalizedRight) {
        return normalizedLeft - normalizedRight
      }

      return (left.title || '').localeCompare(right.title || '')
    })
  }

  if (sortMode === 'title') {
    return nextItems.sort((left, right) => (left.title || '').localeCompare(right.title || ''))
  }

  return nextItems
}

const fieldConfig = [
  { key: 'title', label: 'Job title', type: 'text', required: true },
  { key: 'category', label: 'Category', type: 'select', options: ['job', 'admit', 'result', 'college'] },
  { key: 'eligibility', label: 'Eligibility', type: 'text' },
  { key: 'posts', label: 'Posts', type: 'text' },
  { key: 'fees', label: 'Fees', type: 'text' },
  { key: 'postdate', label: 'Post date', type: 'text', placeholder: 'DD-MM-YYYY' },
  { key: 'lastdate', label: 'Last date', type: 'text', placeholder: 'DD-MM-YYYY' },
  { key: 'department', label: 'Department', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'applylink', label: 'Apply link', type: 'url' },
  { key: 'notification', label: 'Notice link', type: 'url' },
  { key: 'note', label: 'Admin note', type: 'textarea' },
]

const fieldGroups = [
  { label: 'Basic Information', icon: 'fa-briefcase', keys: ['title', 'category', 'eligibility', 'posts'] },
  { label: 'Details & Location', icon: 'fa-map-marker-alt', keys: ['fees', 'department', 'location'] },
  { label: 'Important Dates', icon: 'fa-calendar-alt', keys: ['postdate', 'lastdate'] },
  { label: 'Links & Notes', icon: 'fa-link', keys: ['applylink', 'notification', 'note'] },
]

const initialPasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function isStrongPassword(value = '') {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)
}

function getLoginErrorMessage(error, lockState) {
  if (lockState?.isLocked) {
    return `Locked for ${formatLockoutRemaining(lockState.remainingMs)} on this device.`
  }

  if (error?.code === 'auth/too-many-requests') {
    return 'Temporarily blocked. Try again later.'
  }

  if (error?.code === 'auth/network-request-failed') {
    return 'Network issue. Try again.'
  }

  const attemptsLeft = lockState?.attemptsLeft ?? 0

  if (attemptsLeft > 0) {
    return `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
  }

  return 'Login failed.'
}

export default function JobsAdminBoard() {
  const adminEmail = getAdminEmail()
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [lockState, setLockState] = useState(() => getJobsAdminLockState())
  const [jobs, setJobs] = useState([])
  const [source, setSource] = useState('database')
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategoryTab, setActiveCategoryTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortMode, setSortMode] = useState('smart')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState('create')
  const [draft, setDraft] = useState(createEmptyJobRecord())
  const [feedback, setFeedback] = useState('')
  const [securityOpen, setSecurityOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [securityError, setSecurityError] = useState('')
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm)
  const [portalTarget, setPortalTarget] = useState(null)
  const editorDialogRef = useRef(null)
  const editorBodyRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    if (!hasAdminBackendConfig || !adminAuth) {
      setAuthReady(true)
      return undefined
    }

    setPersistence(adminAuth, browserSessionPersistence).catch(() => {
      // Ignore persistence failures and continue with default browser behavior.
    })

    const unsubscribe = onAuthStateChanged(adminAuth, (user) => {
      if (user && !isAdminEmail(user.email || '')) {
        signOut(adminAuth)
          .catch(() => {
            // Ignore sign-out failures for unauthorized sessions.
          })
          .finally(() => {
            setCurrentUser(null)
            setAuthError('Sirf fixed jobs admin account ko access diya gaya hai.')
            setAuthReady(true)
          })
        return
      }

      if (user) {
        clearJobsAdminFailures()
        setLockState(getJobsAdminLockState())
      }

      setCurrentUser(user)
      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!lockState.isLocked) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setLockState(getJobsAdminLockState())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [lockState.isLocked])

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  const canManageJobs = Boolean(currentUser && isAdminEmail(currentUser.email || ''))

  useEffect(() => {
    if (!canManageJobs) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    fetchJobsBoardData(adminDb)
      .then((result) => {
        if (!active) {
          return
        }

        setJobs(result.items)
        setMeta(result.meta)
        setSource(result.source)
        setLoading(false)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setFeedback('Jobs board abhi Firebase se load nahi ho paya. Fallback source use ho sakta hai.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [canManageJobs])

  useEffect(() => {
    if (!feedback) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setFeedback(''), 2600)
    return () => window.clearTimeout(timeoutId)
  }, [feedback])

  const categoryTabs = useMemo(() => {
    const counts = jobs.reduce((map, job) => {
      const key = getCategoryKey(job.category)
      map.set(key, (map.get(key) || 0) + 1)
      return map
    }, new Map())

    const orderedTabs = Array.from(counts.entries())
      .sort(([leftKey], [rightKey]) => {
        const leftIndex = CATEGORY_ORDER.indexOf(leftKey)
        const rightIndex = CATEGORY_ORDER.indexOf(rightKey)
        const normalizedLeft = leftIndex === -1 ? CATEGORY_ORDER.length : leftIndex
        const normalizedRight = rightIndex === -1 ? CATEGORY_ORDER.length : rightIndex

        if (normalizedLeft !== normalizedRight) {
          return normalizedLeft - normalizedRight
        }

        return leftKey.localeCompare(rightKey)
      })
      .map(([key, count]) => ({
        key,
        count,
        ...getCategoryMeta(key),
      }))

    return [{ key: 'all', count: jobs.length, ...CATEGORY_META.all }, ...orderedTabs]
  }, [jobs])

  useEffect(() => {
    if (activeCategoryTab === 'all') {
      return
    }

    const isTabAvailable = categoryTabs.some((tab) => tab.key === activeCategoryTab)
    if (!isTabAvailable) {
      setActiveCategoryTab('all')
    }
  }, [activeCategoryTab, categoryTabs])

  const filteredJobs = useMemo(() => {
    const visibleJobs = jobs.filter((job) => {
      const text = searchTerm.trim().toLowerCase()
      const matchesSearch = !text || [job.title, job.eligibility, job.department, job.location, job.note].some((value) => (value || '').toLowerCase().includes(text))
      const matchesCategory = activeCategoryTab === 'all' || getCategoryKey(job.category) === activeCategoryTab
      const status = getStatusMeta(job).tone
      const matchesStatus = statusFilter === 'all' || status === statusFilter || (statusFilter === 'live' && status === 'today')
      return matchesSearch && matchesCategory && matchesStatus
    })

    return sortFilteredJobs(visibleJobs, sortMode)
  }, [jobs, searchTerm, activeCategoryTab, statusFilter, sortMode])

  const activeCategory = categoryTabs.find((tab) => tab.key === activeCategoryTab) || categoryTabs[0] || { ...CATEGORY_META.all, key: 'all', count: jobs.length }
  const activeCategoryContent = activeCategoryTab === 'all' ? null : getJobCategoryContent(activeCategoryTab)
  const sortOptions = useMemo(() => (
    activeCategoryContent && !activeCategoryContent.hasDeadline
      ? [
          { value: 'smart', label: 'Smart order' },
          { value: 'recent', label: 'Recently edited' },
          { value: 'title', label: 'Title A-Z' },
        ]
      : [
          { value: 'smart', label: 'Smart order' },
          { value: 'recent', label: 'Recently edited' },
          { value: 'deadline', label: 'Deadline first' },
          { value: 'title', label: 'Title A-Z' },
        ]
  ), [activeCategoryContent])
  const statusOptions = useMemo(() => (
    activeCategoryContent && !activeCategoryContent.hasDeadline
      ? [
          { value: 'all', label: 'All status' },
          { value: 'live', label: 'Updated' },
          { value: 'fresh', label: 'Fresh' },
          { value: 'missing', label: 'Missing link' },
        ]
      : [
          { value: 'all', label: 'All status' },
          { value: 'live', label: 'Live' },
          { value: 'soon', label: 'Ending soon' },
          { value: 'today', label: 'Today' },
          { value: 'expired', label: 'Expired' },
          { value: 'missing', label: 'Missing date' },
        ]
  ), [activeCategoryContent])

  const protectedCount = useMemo(
    () => filteredJobs.filter((job) => Boolean(job.preserveOnImport || job.manualEditedAt)).length,
    [filteredJobs],
  )

  useEffect(() => {
    if (!sortOptions.some((option) => option.value === sortMode)) {
      setSortMode('smart')
    }
  }, [sortMode, sortOptions])

  useEffect(() => {
    if (!statusOptions.some((option) => option.value === statusFilter)) {
      setStatusFilter('all')
    }
  }, [statusFilter, statusOptions])

  const persistJobs = async (nextJobs, successMessage) => {
    setSaving(true)

    try {
      const result = await saveJobsBoard(nextJobs, currentUser?.email || '', adminDb)
      setJobs(result.items)
      setMeta(result.meta)
      setSource(result.source)
      setFeedback(successMessage)
      return true
    } catch {
      setFeedback('Firebase sync failed. Database rules ya network check karein.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setEditorMode('create')
    setDraft(createEmptyJobRecord())
    setEditorOpen(true)
  }

  const openEdit = (job) => {
    setEditorMode('edit')
    setDraft(job)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setDraft(createEmptyJobRecord())
  }

  useEffect(() => {
    if (!editorOpen || !portalTarget) {
      return undefined
    }

    const root = document.documentElement
    const body = document.body
    const scrollbarWidth = window.innerWidth - root.clientWidth
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousBodyPaddingRight = body.style.paddingRight

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    const frameId = window.requestAnimationFrame(() => {
      editorBodyRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      editorDialogRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.paddingRight = previousBodyPaddingRight
      restoreFocusRef.current?.focus?.()
    }
  }, [editorOpen, portalTarget])

  useEffect(() => {
    if (!editorOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeEditor()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editorOpen])

  const handleDraftChange = (key, value) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handlePasswordFieldChange = (key, value) => {
    setPasswordForm((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()

    if (!hasAdminBackendConfig || !adminAuth) {
      setAuthError('Separate admin backend config missing hai.')
      return
    }

    const currentLockState = getJobsAdminLockState()
    setLockState(currentLockState)
    setAuthError('')

    if (currentLockState.isLocked) {
      setAuthError(`Locked for ${formatLockoutRemaining(currentLockState.remainingMs)} on this device.`)
      return
    }

    if (!loginPassword.trim()) {
      setAuthError('Enter password.')
      return
    }

    setLoginBusy(true)

    try {
      const result = await signInWithEmailAndPassword(adminAuth, adminEmail, loginPassword)

      if (!isAdminEmail(result.user.email || '')) {
        await signOut(adminAuth)
        setAuthError('Yeh jobs admin account nahi hai.')
        return
      }

      clearJobsAdminFailures()
      setLockState(getJobsAdminLockState())
      setAuthError('')
      setLoginPassword('')
    } catch (error) {
      const nextLockState = isJobsAdminCredentialError(error)
        ? registerJobsAdminFailure()
        : getJobsAdminLockState()

      setLockState(nextLockState)
      setAuthError(getLoginErrorMessage(error, nextLockState))
    } finally {
      setLoginBusy(false)
    }
  }

  const handleAdminLogout = async () => {
    if (!adminAuth) {
      return
    }

    await signOut(adminAuth)
    setAuthError('')
    setSecurityOpen(false)
    setPasswordForm(initialPasswordForm)
    setSecurityError('')
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setSecurityError('')

    if (!currentUser?.email) {
      setSecurityError('Admin session missing hai. Dobara login karein.')
      return
    }

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setSecurityError('Old password aur naya password dono bharna zaroori hai.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityError('New password aur confirm password match nahi kar rahe.')
      return
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      setSecurityError('Naya password kam se kam 8 chars ka ho, aur usme uppercase, lowercase, number aur special character ho.')
      return
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setSecurityError('Naya password purane password se alag hona chahiye.')
      return
    }

    setPasswordBusy(true)

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.oldPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, passwordForm.newPassword)
      setPasswordForm(initialPasswordForm)
      setFeedback('Admin password successfully updated.')
      setSecurityOpen(false)
    } catch (error) {
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
        setSecurityError('Old password galat hai.')
      } else {
        setSecurityError('Password update complete nahi hua. Thodi der baad try karein.')
      }
    } finally {
      setPasswordBusy(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!draft.title.trim()) {
      setFeedback('Title required hai.')
      return
    }

    const nextDraft = {
      ...draft,
      createdAt: draft.createdAt || Date.now(),
      manualEditedAt: Date.now(),
      preserveOnImport: true,
    }

    const nextJobs = editorMode === 'edit'
      ? jobs.map((job) => (job.id === draft.id ? { ...job, ...nextDraft } : job))
      : [{ ...nextDraft }, ...jobs]

    const didSave = await persistJobs(nextJobs, editorMode === 'edit' ? 'Job updated successfully.' : 'Job created successfully.')

    if (didSave) {
      closeEditor()
    }
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm('Kya aap is job entry ko delete karna chahte hain?')) {
      return
    }

    const nextJobs = jobs.filter((job) => job.id !== jobId)
    await persistJobs(nextJobs, 'Job deleted successfully.')
  }

  const handleImportSheet = async () => {
    if (!window.confirm('Sheet data ko smart merge karna hai? Website par edited entries safe rahengi aur sirf naye / unedited records sync honge.')) {
      return
    }

    setSaving(true)
    try {
      const seedItems = await fetchJobsSheetSeed()
      const { items: mergedItems, stats } = mergeImportedJobs(jobs, seedItems)
      const result = await saveJobsBoard(mergedItems, currentUser?.email || '', adminDb)
      setJobs(result.items)
      setMeta(result.meta)
      setSource(result.source)
      setFeedback(`Sheet sync complete. ${stats.added} new, ${stats.updated} refreshed, ${stats.preserved} protected.`)
    } catch {
      setFeedback('Sheet import failed. Network aur Firebase access check karein.')
    } finally {
      setSaving(false)
    }
  }

  if (!authReady) {
    return <div className="jobs-admin-state">Checking admin session...</div>
  }

  if (!hasAdminBackendConfig || !adminAuth || !adminDb) {
    return (
      <div className="jobs-admin-login-shell compact">
        <div className="jobs-admin-login-card compact">
          <button type="button" className="jobs-admin-popup-close" onClick={() => router.push('/jobs')}>
            <i className="fas fa-times"></i>
          </button>

          <div className="jobs-admin-popup-icon">
            <i className="fas fa-shield-halved"></i>
          </div>

          <h1>Admin Setup</h1>
          <p className="jobs-admin-login-subtitle">Separate jobs admin backend required.</p>

          <div className="jobs-admin-login-actions single">
            <Link href="/jobs" className="jobs-admin-ghost-btn">Back to Jobs</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="jobs-admin-login-shell compact">
        <div className="jobs-admin-login-card compact">
          <button type="button" className="jobs-admin-popup-close" onClick={() => router.push('/jobs')}>
            <i className="fas fa-times"></i>
          </button>

          <div className="jobs-admin-popup-icon">
            <i className="fas fa-user-shield"></i>
          </div>

          <h1>Official Login</h1>
          <p className="jobs-admin-login-subtitle">Jobs control room</p>

          <form className="jobs-admin-login-form" onSubmit={handleAdminLogin}>
            <label className="jobs-admin-field full">
              <span>Password</span>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                disabled={loginBusy || lockState.isLocked}
              />
            </label>

            {authError && <div className="jobs-admin-auth-error">{authError}</div>}

            <div className="jobs-admin-login-actions single">
              <button type="submit" className="jobs-admin-primary-btn" disabled={loginBusy || lockState.isLocked}>
                {loginBusy ? 'Checking...' : 'Admin Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (!canManageJobs) {
    return (
      <div className="jobs-admin-state-card denied">
        <i className="fas fa-user-shield"></i>
        <h1>Access denied</h1>
        <p>{currentUser.email} ko jobs editing permission nahi hai. Customer accounts is board ko access nahi kar sakte.</p>
        <Link href="/" className="jobs-admin-link-btn">Home par wapas jao</Link>
      </div>
    )
  }

  const editorDialog = editorOpen && portalTarget
    ? createPortal(
        <div className="jobs-admin-editor-overlay" onClick={closeEditor}>
          <div
            ref={editorDialogRef}
            className="jobs-admin-editor"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="jobs-admin-editor-title"
            tabIndex={-1}
          >
            <div className="jobs-admin-editor-top">
              <div className="jobs-admin-editor-copy">
                <span className="jobs-admin-eyebrow">{editorMode === 'edit' ? 'Edit entry' : 'Create entry'}</span>
                <h2 id="jobs-admin-editor-title">{editorMode === 'edit' ? 'Update job entry' : 'Add new job entry'}</h2>
                <p>
                  {editorMode === 'edit'
                    ? 'Make changes from the same screen. The editor stays pinned to the viewport while the page behind it remains locked.'
                    : 'Build a polished card with the right dates, links, and internal notes before publishing it to the live board.'}
                </p>
              </div>

              <div className="jobs-admin-editor-top-actions">
                <div className="jobs-admin-editor-meta">
                  <span className="jobs-admin-editor-chip"><i className="fas fa-layer-group"></i>{getJobCategoryContent(draft.category).label}</span>
                  <span className="jobs-admin-editor-chip subtle">
                    <i className={`fas ${editorMode === 'edit' ? 'fa-wand-magic-sparkles' : 'fa-pen-ruler'}`}></i>
                    {editorMode === 'edit' ? 'Live edit' : 'Draft mode'}
                  </span>
                </div>

                <button type="button" className="jobs-admin-close" onClick={closeEditor} aria-label="Close editor">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <form className="jobs-admin-form" onSubmit={handleSubmit}>
              <div ref={editorBodyRef} className="ja-form-body">
                <div className="jobs-admin-editor-helper">
                  <i className="fas fa-sparkles"></i>
                  <span>{getEditorGuide(draft.category)}</span>
                </div>

                {fieldGroups.map((group) => (
                  (() => {
                    const visibleKeys = group.keys.filter((key) => shouldRenderEditorField(key, draft.category))
                    if (!visibleKeys.length) {
                      return null
                    }

                    return (
                      <section className="ja-form-section" key={group.label}>
                        <h3 className="ja-form-section-head">
                          <i className={`fas ${group.icon}`}></i>
                          {group.label}
                        </h3>
                        <div className="ja-form-section-fields">
                          {visibleKeys.map((key) => {
                            const baseField = fieldConfig.find((f) => f.key === key)
                            if (!baseField) return null
                            const field = getFieldConfigForCategory(baseField, draft.category)

                            return (
                              <label className={`jobs-admin-field ${field.type === 'textarea' ? 'full' : ''}`} key={field.key}>
                                <span>{field.label}</span>
                                {field.type === 'select' ? (
                                  <select value={draft[field.key] || ''} onChange={(event) => handleDraftChange(field.key, event.target.value)}>
                                    {field.options.map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : field.type === 'textarea' ? (
                                  <textarea
                                    rows={4}
                                    value={draft[field.key] || ''}
                                    placeholder={field.placeholder || ''}
                                    onChange={(event) => handleDraftChange(field.key, event.target.value)}
                                  />
                                ) : (
                                  <input
                                    type={field.type}
                                    value={draft[field.key] || ''}
                                    placeholder={field.placeholder || ''}
                                    onChange={(event) => handleDraftChange(field.key, event.target.value)}
                                    required={field.required}
                                  />
                                )}
                              </label>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })()
                ))}
              </div>

              <div className="jobs-admin-form-actions">
                <div className="jobs-admin-form-actions-copy">
                  <strong>{editorMode === 'edit' ? 'Editing live listing' : 'Ready to publish'}</strong>
                  <span>
                    {editorMode === 'edit'
                      ? 'Save karke changes turant live board par reflect ho jayenge.'
                      : 'Create karte hi nayi entry board ke top par add ho jayegi.'}
                  </span>
                </div>

                <div className="jobs-admin-form-actions-buttons">
                  <button type="button" className="jobs-admin-ghost-btn" onClick={closeEditor}>
                    <i className="fas fa-arrow-left"></i>
                    Cancel
                  </button>
                  <button type="submit" className="jobs-admin-primary-btn" disabled={saving}>
                    <i className={`fas ${saving ? 'fa-spinner fa-spin' : editorMode === 'edit' ? 'fa-floppy-disk' : 'fa-plus'}`}></i>
                    {saving ? 'Saving...' : editorMode === 'edit' ? 'Save changes' : 'Create entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        portalTarget,
      )
    : null

  return (
    <>
      <div className="jobs-admin-page">
        <div className="jobs-admin-hero">
        <div className="jobs-admin-hero-copy">
          <span className="jobs-admin-eyebrow"><i className="fas fa-shield-halved"></i> Official Admin</span>
          <h1>Job Admin Panel</h1>
        </div>

        <div className="jobs-admin-hero-actions">
          <Link href="/jobs" className="jobs-admin-ghost-btn"><i className="fas fa-eye"></i> Public View</Link>
          <button
            type="button"
            className={`jobs-admin-ghost-btn${alertsOpen ? ' active' : ''}`}
            onClick={() => setAlertsOpen((prev) => !prev)}
            title="Deadlines & Alerts Monitor"
          >
            <i className="fas fa-bell"></i> Alerts Monitor
          </button>
          <button
            type="button"
            className={`jobs-admin-ghost-btn${securityOpen ? ' active' : ''}`}
            onClick={() => setSecurityOpen((previous) => !previous)}
          >
            <i className="fas fa-key"></i> Password
          </button>
          <button type="button" className="jobs-admin-ghost-btn" onClick={handleImportSheet} disabled={saving}><i className="fas fa-file-import"></i> Smart Import</button>
          <button type="button" className="jobs-admin-primary-btn" onClick={openCreate}><i className="fas fa-plus"></i> New Entry</button>
          <button type="button" className="jobs-admin-ghost-btn" onClick={handleAdminLogout}><i className="fas fa-arrow-right-from-bracket"></i> Logout</button>
        </div>
      </div>

      {securityOpen && (
        <section className="jobs-admin-password-panel">
          <div className="jobs-admin-password-copy">
            <span className="jobs-admin-eyebrow">Password</span>
            <h2>Change password</h2>
            <p>Verify old password, then save a new one.</p>
          </div>

          <form className="jobs-admin-password-form" onSubmit={handlePasswordChange}>
            <label className="jobs-admin-field">
              <span>Old password</span>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) => handlePasswordFieldChange('oldPassword', event.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="jobs-admin-field">
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => handlePasswordFieldChange('newPassword', event.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="jobs-admin-field full">
              <span>Confirm new password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => handlePasswordFieldChange('confirmPassword', event.target.value)}
                autoComplete="new-password"
              />
            </label>

            {securityError && <div className="jobs-admin-auth-error">{securityError}</div>}

            <div className="jobs-admin-password-actions">
              <button type="submit" className="jobs-admin-primary-btn" disabled={passwordBusy}>
                {passwordBusy ? 'Updating...' : 'Change password'}
              </button>
            </div>
          </form>
        </section>
      )}

      {alertsOpen && (
        <section style={{ marginBottom: '20px' }}>
          <JobDeadlineAlerts />
        </section>
      )}

      <div className="jobs-admin-category-tabs" role="tablist" aria-label="Job categories">
        {categoryTabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            className={`jobs-admin-category-tab${activeCategoryTab === tab.key ? ' active' : ''}`}
            style={{ '--tab-accent': tab.color }}
            onClick={() => setActiveCategoryTab(tab.key)}
          >
            <span className="jobs-admin-category-tab-icon"><i className={`fas ${tab.icon}`}></i></span>
            <span className="jobs-admin-category-tab-copy">
              <strong>{tab.label}</strong>
            </span>
          </button>
        ))}
      </div>

      <section className="jobs-admin-board-shell">
        <div className="jobs-admin-board-header">
          <div className="jobs-admin-board-copy">
            <span className="jobs-admin-board-kicker">Current View</span>
            <h2>{activeCategory.key === 'all' ? 'All Entries' : activeCategory.label}</h2>
          </div>

          <div className="jobs-admin-board-pills">
            <span className="jobs-admin-board-pill"><i className="fas fa-list-check"></i>{filteredJobs.length} visible</span>
            <span className="jobs-admin-board-pill protected"><i className="fas fa-shield-check"></i>{protectedCount} protected</span>
          </div>
        </div>

        <div className="jobs-admin-toolbar">
          <div className="jobs-admin-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Title, department, location..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} className="jobs-admin-select">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="jobs-admin-select">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="jobs-admin-meta-row">
          <span>Source: {source === 'database' ? 'Firebase live board' : 'Google Sheet fallback'}</span>
          <span>Last saved: {formatMetaDate(meta?.updatedAt)}</span>
          <span>Updated by: {meta?.updatedBy || currentUser.email}</span>
        </div>

        {feedback && <div className="jobs-admin-feedback">{feedback}</div>}

        {loading ? (
          <div className="jobs-admin-state">Jobs board load ho raha hai...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-admin-state">Current filters me koi job entry nahi mili.</div>
        ) : (
          <div className="jobs-admin-list">
            {filteredJobs.map((job) => {
              const status = getStatusMeta(job)
              const categoryMeta = getCategoryMeta(getCategoryKey(job.category))
              const isProtected = Boolean(job.preserveOnImport || job.manualEditedAt)
              const isFresh = isNewJobItem(job) && status.tone !== 'expired'
              const lastTouchedAt = job.manualEditedAt || job.updatedAt
              const metaItems = buildAdminMetaItems(job)

              return (
                <article className="jobs-admin-item" key={job.id || job.title}>
                  <div className="jobs-admin-item-copy">
                    <div className="jobs-admin-item-top">
                      <div className="jobs-admin-item-badges">
                        <span className={`jobs-admin-status ${status.tone}`}>{status.label}</span>
                        <span className="jobs-admin-category" style={{ '--category-accent': categoryMeta.color }}>{categoryMeta.label}</span>
                        {isFresh && <span className="jobs-admin-status fresh">New</span>}
                      </div>

                      {isProtected && (
                        <span className="jobs-admin-sync-pill protected">
                          <i className="fas fa-shield-check"></i>
                          Protected on import
                        </span>
                      )}
                    </div>

                    <h2>{job.title || 'Untitled entry'}</h2>
                    <p>{getAdminSummary(job)}</p>

                    <div className="jobs-admin-item-meta">
                      {metaItems.map((item) => (
                        <span key={`${job.id || job.title}-${item.label}`}><strong>{item.label}:</strong> {item.value}</span>
                      ))}
                    </div>

                    <div className="jobs-admin-item-foot">
                      <span><i className="fas fa-clock-rotate-left"></i>{formatMetaDate(lastTouchedAt)}</span>
                      <span><i className="fas fa-user-pen"></i>{job.updatedBy || currentUser.email}</span>
                    </div>
                  </div>

                  <div className="jobs-admin-item-actions">
                    <button type="button" className="jobs-admin-item-btn" onClick={() => openEdit(job)}><i className="fas fa-pen-to-square"></i>Edit</button>
                    <button type="button" className="jobs-admin-item-btn danger" onClick={() => handleDelete(job.id)}><i className="fas fa-trash"></i>Delete</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      </div>
      {editorDialog}
    </>
  )
}