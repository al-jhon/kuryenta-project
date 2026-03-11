// src/firebase/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ──────── TYPES ────────
export interface SignUpData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  sex: string;
  birthdate: string;
  province: string;
  municipality: string;
  barangay: string;
}

export interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sex: string;
  birthdate: string;
  province: string;
  municipality: string;
  barangay: string;
  createdAt: unknown;
}

// ──────── SIGN UP ────────
export const signUpUser = async (data: SignUpData): Promise<User> => {
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  const user = userCredential.user;

  // 2. Save extra user data to Firestore
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
    createdAt: serverTimestamp(),
  });

  // 3. Sign out after creating (user will log in manually)
  await signOut(auth);

  return user;
};

// ──────── LOG IN ────────
export const logInUser = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

// ──────── LOG OUT ────────
export const logOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// ──────── GET USER DATA FROM FIRESTORE ────────
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  }
  return null;
};

// ──────── AUTH STATE LISTENER ────────
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
