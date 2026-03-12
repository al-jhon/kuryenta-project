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
import { createRtdbUser } from './realtimeService';

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
  profilePictureUrl: string; // ✅ ADD
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
  profilePictureUrl: string; // ✅ ADD
  createdAt: unknown;
}

export const signUpUser = async (data: SignUpData): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  const user = userCredential.user;

  // Save to Firestore
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
    profilePictureUrl: data.profilePictureUrl, // ✅ Cloudinary URL
    createdAt: serverTimestamp(),
  });

  // Save to Realtime Database
  await createRtdbUser(user.uid, {
    firstName: data.firstName,
    lastName: data.lastName,
    barangay: data.barangay,
    municipality: data.municipality,
  });

  await signOut(auth);
  return user;
};

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

export const logOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  }
  return null;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
