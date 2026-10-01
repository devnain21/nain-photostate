const DEFAULT_ADMIN_EMAIL = 'admin@csc.com'
const JOBS_ADMIN_GUARD_KEY = 'jobs_admin_guard'
const MAX_FAILURES = 5
const LOCK_MS = 60 * 60 * 1000

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readGuardState() {
  if (!canUseStorage()) {
    return { failures: 0, lockedUntil: 0 }
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(JOBS_ADMIN_GUARD_KEY) || '{}')
    return {
      failures: Number(parsed.failures) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    }
  } catch {
    return { failures: 0, lockedUntil: 0 }
  }
}

function writeGuardState(state) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(JOBS_ADMIN_GUARD_KEY, JSON.stringify(state))
}

export function getAdminEmail() {
  return String(process.env.NEXT_PUBLIC_JOBS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase()
}

export function isAdminEmail(email = '') {
  return email.trim().toLowerCase() === getAdminEmail()
}

export function getJobsAdminLockState(now = Date.now()) {
  const storedState = readGuardState()
  const didLockExpire = storedState.lockedUntil > 0 && storedState.lockedUntil <= now
  const state = didLockExpire ? { failures: 0, lockedUntil: 0 } : storedState
  const remainingMs = Math.max(0, state.lockedUntil - now)
  const isLocked = remainingMs > 0

  if (didLockExpire) {
    writeGuardState(state)
  }

  return {
    attempts: state.failures,
    attemptsLeft: Math.max(0, MAX_FAILURES - state.failures),
    lockedUntil: state.lockedUntil,
    remainingMs,
    isLocked,
  }
}

export function registerJobsAdminFailure(now = Date.now()) {
  const previous = getJobsAdminLockState(now)
  const failures = Math.min(previous.attempts + 1, MAX_FAILURES)
  const shouldLock = failures >= MAX_FAILURES
  const nextState = {
    failures,
    lockedUntil: shouldLock ? now + LOCK_MS : 0,
  }

  writeGuardState(nextState)
  return getJobsAdminLockState(now)
}

export function clearJobsAdminFailures() {
  writeGuardState({ failures: 0, lockedUntil: 0 })
}

export function formatLockoutRemaining(remainingMs = 0) {
  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}

export function isJobsAdminCredentialError(error) {
  return [
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
    'auth/wrong-password',
  ].includes(error?.code || '')
}