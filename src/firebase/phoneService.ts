// src/firebase/phoneService.ts
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from './firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

// ──────── SETUP RECAPTCHA ────────
// Must be called AFTER the button element exists in the DOM
export const setupRecaptcha = (buttonId: string): void => {
  // Clean up old verifier if exists
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible', // Hidden — no user interaction needed
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  });
};

// ──────── SEND OTP ────────
// phoneNumber must include country code: "+639171234567"
export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized. Call setupRecaptcha() first.');
  }

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    console.log('OTP sent to', phoneNumber);
    return true;
  } catch (error) {
    // If reCAPTCHA fails, we need to reset it
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
    throw error;
  }
};

// ──────── VERIFY OTP ────────
// Returns true if code is correct
export const verifyOTP = async (otpCode: string): Promise<boolean> => {
  if (!confirmationResult) {
    throw new Error('No OTP was sent. Please request a new code.');
  }

  // 1. Confirm the OTP code
  const userCredential = await confirmationResult.confirm(otpCode);

  // 2. Delete the temporary phone-auth user
  //    (We only want email/password auth — phone is just for verification)
  try {
    await userCredential.user.delete();
    // delete() automatically signs out the user
  } catch {
    // If delete fails, just sign out
    await signOut(auth);
  }

  // 3. Clean up
  confirmationResult = null;

  return true;
};

// ──────── CLEANUP ────────
// Call this when component unmounts
export const cleanupRecaptcha = (): void => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};
