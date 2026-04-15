import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { createRtdbUser } from './realtimeService'

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════
export interface SignUpData {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  sex: string
  birthdate: string
  province: string
  municipality: string
  barangay: string
  profilePictureUrl: string
}

export interface UserData {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  sex: string
  birthdate: string
  province: string
  municipality: string
  barangay: string
  profilePictureUrl: string
  createdAt: unknown
}

// ══════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════
export const signUpUser = async (data: SignUpData): Promise<User> => {
  // ── 1. Create Firebase Auth account ──
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  )
  const user = userCredential.user

  // ── 2. Save FULL profile to Firestore ──
  await setDoc(doc(db, 'users', user.uid), {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: `+63${data.phoneNumber}`,
    email: data.email,
    sex: data.sex,
    birthdate: data.birthdate,
    province: data.province,
    municipality: data.municipality,
    barangay: data.barangay,
    profilePictureUrl: data.profilePictureUrl,
    createdAt: serverTimestamp(),
  })

  // ── 3. Save to Realtime Database (for ESP32 + admin) ──
  await createRtdbUser(user.uid, {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: `+63${data.phoneNumber}`,   // ✅ Fixed
    barangay: data.barangay,
    municipality: data.municipality,
    profilePictureUrl: data.profilePictureUrl, // ✅ Fixed
  })

  // ── 4. Sign out after signup (user must log in manually) ──
  await signOut(auth)

  return user
}

// ══════════════════════════════════════
// LOG IN
// ══════════════════════════════════════
export const logInUser = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )
  return userCredential.user
}

// ══════════════════════════════════════
// LOG OUT
// ══════════════════════════════════════
export const logOutUser = async (): Promise<void> => {
  await signOut(auth)
}

// ══════════════════════════════════════
// GET USER DATA (from Firestore)
// ══════════════════════════════════════
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data() as UserData
  }
  return null
}

// ══════════════════════════════════════
// AUTH STATE LISTENER
// ══════════════════════════════════════
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
