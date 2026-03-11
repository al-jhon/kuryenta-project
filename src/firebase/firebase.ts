// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ REPLACE these with YOUR values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyClYOuFHBd0u8ODoEIoUw6dS1E_ZFiV-I8",
  authDomain: "kuryenta-4f343.firebaseapp.com",
  projectId: "kuryenta-4f343",
  storageBucket: "kuryenta-4f343.firebasestorage.app",
  messagingSenderId: "996087207944",
  appId: "1:996087207944:web:1109fa1db451dd492499bd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
