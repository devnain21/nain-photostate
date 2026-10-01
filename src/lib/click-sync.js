import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { get, ref, update } from 'firebase/database'
import { publicAuth, publicDb } from '../firebase'

let clickUid = null
let pushTimer = null

export function setClickUid(uid) {
  clickUid = uid || null
}

export function watchClickAccount(onUser) {
  return onAuthStateChanged(publicAuth, onUser)
}

export async function signInForClicks() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(publicAuth, provider)
}

export async function signOutClicks() {
  clickUid = null
  return signOut(publicAuth)
}

export function mergeClickMaps(localMap = {}, remoteMap = {}) {
  const merged = { ...remoteMap }

  Object.entries(localMap).forEach(([key, count]) => {
    const clicks = Number(count) || 0
    if (!key || clicks <= 0) return
    merged[key] = Math.max(Number(merged[key]) || 0, clicks)
  })

  return merged
}

export async function pullClickMap(uid) {
  const snapshot = await get(ref(publicDb, `home_service_preferences/${uid}/serviceClicks`))
  return snapshot.exists() ? snapshot.val() || {} : {}
}

export function queueClickCloudSave(clicks) {
  if (!clickUid) return

  const uid = clickUid
  const payload = clicks
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    update(ref(publicDb, `home_service_preferences/${uid}`), {
      serviceClicks: payload,
      clicksUpdatedAt: Date.now(),
    }).catch(() => {})
  }, 400)
}

export function googleLoginMessage(error) {
  const code = error?.code || ''

  if (code === 'auth/operation-not-allowed') {
    return 'Google login abhi Firebase par off hai. Authentication > Sign-in method > Google ko on karna hoga.'
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Is site ka domain Firebase Authentication > Settings > Authorized domains mein add karna hoga.'
  }

  if (code === 'auth/popup-blocked') {
    return 'Browser ne login window block kar di. Popup allow karke dubara try karein.'
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google login window band ho gayi.'
  }

  return 'Google login nahi ho paya. Thodi der baad dubara try karein.'
}
