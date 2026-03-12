<!-- src/features/signUpPage/SignUpScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="Kuryenta Logo" />

        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="log-in-text">Sign Up</p>
            <hr class="hr-right" />
          </div>

          <div class="second-container">
            <!-- FIRST NAME -->
            <div class="input-group">
              <label class="label" for="firstName">First Name</label>
              <input
                v-model="signUpData.firstName"
                autocomplete="given-name"
                name="firstName"
                id="firstName"
                class="input"
                type="text"
              />
            </div>

            <!-- LAST NAME -->
            <div class="input-group">
              <label class="label" for="lastName">Last Name</label>
              <input
                v-model="signUpData.lastName"
                autocomplete="family-name"
                name="lastName"
                id="lastName"
                class="input"
                type="text"
              />
            </div>

            <!-- ═══════════════════════════════════════ -->
            <!-- PHONE NUMBER + OTP VERIFICATION        -->
            <!-- ═══════════════════════════════════════ -->
            <div class="input-group">
              <label class="label" for="phoneNumber">Phone Number</label>
              <div class="phone-input-wrapper">
                <span class="country-code">+63</span>
                <input
                  v-model="signUpData.phoneNumber"
                  autocomplete="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  class="input phone-input"
                  type="tel"
                  maxlength="10"
                  placeholder="9XX XXX XXXX"
                  :disabled="signUpData.isPhoneVerified"
                  @input="formatPhone"
                />
                <!-- SEND OTP BUTTON -->
                <button
                  id="send-otp-button"
                  class="send-otp-btn"
                  :class="{ verified: signUpData.isPhoneVerified }"
                  :disabled="!canSendOTP || signUpData.isPhoneVerified"
                  @click="handleSendOTP"
                >
                  {{ signUpData.isPhoneVerified ? '✓' : isSending ? '...' : 'Send' }}
                </button>
              </div>
              <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
            </div>

            <!-- OTP INPUT (shows after OTP is sent, hides after verified) -->
            <div v-if="isOTPSent && !signUpData.isPhoneVerified" class="input-group">
              <label class="label" for="otpCode">Enter 6-digit code</label>
              <div class="otp-wrapper">
                <input
                  v-model="otpCode"
                  name="otpCode"
                  id="otpCode"
                  class="input otp-input"
                  type="text"
                  maxlength="6"
                  placeholder="000000"
                  @input="formatOTP"
                />
                <button
                  class="verify-otp-btn"
                  :disabled="otpCode.length !== 6 || isVerifying"
                  @click="handleVerifyOTP"
                >
                  {{ isVerifying ? '...' : 'Verify' }}
                </button>
              </div>
              <p v-if="otpError" class="error-text">{{ otpError }}</p>
              <p v-if="!isSending" class="resend-text" @click="handleSendOTP">
                Didn't receive? <span class="resend-link">Resend Code</span>
              </p>
            </div>

            <!-- VERIFIED BADGE (shows after successful verification) -->
            <div v-if="signUpData.isPhoneVerified" class="verified-message">
              ✓ Phone number verified
            </div>

            <!-- EMAIL -->
            <div class="input-group">
              <label class="label" for="email">Email Address</label>
              <input
                v-model="signUpData.email"
                autocomplete="email"
                name="email"
                id="email"
                class="input"
                type="email"
              />
            </div>

            <!-- PASSWORD -->
            <div class="input-group-password">
              <label class="label" for="password">Password</label>
              <input
                v-model="signUpData.password"
                autocomplete="new-password"
                name="password"
                id="password"
                class="input"
                :type="showPassword ? 'text' : 'password'"
              />
              <img
                class="eye"
                :src="showPassword ? 'src/assets/eye-open.png' : 'src/assets/eye-close.png'"
                :alt="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              />
            </div>

            <!-- CONFIRM PASSWORD -->
            <div class="input-group-password">
              <label class="label" for="confirmPassword">Confirm Password</label>
              <input
                v-model="signUpData.confirmPassword"
                autocomplete="new-password"
                name="confirmPassword"
                id="confirmPassword"
                class="input"
                :type="showConfirmPassword ? 'text' : 'password'"
              />
              <img
                class="eye"
                :src="showConfirmPassword ? 'src/assets/eye-open.png' : 'src/assets/eye-close.png'"
                :alt="showConfirmPassword ? 'Hide password' : 'Show password'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </div>

            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            <button @click="proceed">Proceed</button>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { signUpData } from 'src/stores/signUpStore';
import {
  setupRecaptcha,
  sendOTP,
  verifyOTP,
  cleanupRecaptcha,
} from 'src/firebase/phoneService';

const router = useRouter();

// Form errors
const phoneError = ref('');
const otpError = ref('');
const errorMessage = ref('');

// Password toggles
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// OTP states
const isOTPSent = ref(false);
const isSending = ref(false);
const isVerifying = ref(false);
const otpCode = ref('');

// Can send OTP only when phone number is valid (10 digits starting with 9)
const canSendOTP = computed(() => {
  return /^9\d{9}$/.test(signUpData.phoneNumber) && !isSending.value;
});

// ──────── LIFECYCLE ────────
onMounted(() => {
  // Initialize reCAPTCHA on the send button
  // Must run AFTER the button exists in the DOM
  setupRecaptcha('send-otp-button');
});

onUnmounted(() => {
  cleanupRecaptcha();
});

// ──────── NAVIGATION ────────
const goBack = (): void => {
  router.back();
};

// ──────── PHONE FORMAT ────────
const formatPhone = (): void => {
  signUpData.phoneNumber = signUpData.phoneNumber.replace(/\D/g, '');

  if (signUpData.phoneNumber.length > 0 && signUpData.phoneNumber[0] !== '9') {
    signUpData.phoneNumber = '';
    phoneError.value = 'Philippine number must start with 9';
    return;
  }

  // Reset verification if phone number changes
  if (signUpData.isPhoneVerified) {
    signUpData.isPhoneVerified = false;
    isOTPSent.value = false;
    otpCode.value = '';
  }

  if (signUpData.phoneNumber.length > 0 && signUpData.phoneNumber.length < 10) {
    phoneError.value = 'Must be 10 digits (e.g. 9171234567)';
  } else {
    phoneError.value = '';
  }
};

// Only allow digits in OTP
const formatOTP = (): void => {
  otpCode.value = otpCode.value.replace(/\D/g, '');
};

// ──────── SEND OTP ────────
const handleSendOTP = async (): Promise<void> => {
  if (!canSendOTP.value || signUpData.isPhoneVerified) return;

  isSending.value = true;
  phoneError.value = '';
  otpError.value = '';

  try {
    const fullNumber = `+63${signUpData.phoneNumber}`;
    await sendOTP(fullNumber);
    isOTPSent.value = true;
    otpCode.value = '';
    console.log('OTP sent to', fullNumber);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    switch (err.code) {
      case 'auth/too-many-requests':
        phoneError.value = 'Too many attempts. Please try again later.';
        break;
      case 'auth/invalid-phone-number':
        phoneError.value = 'Invalid phone number.';
        break;
      case 'auth/quota-exceeded':
        phoneError.value = 'SMS quota exceeded. Try again tomorrow.';
        break;
      default:
        phoneError.value = err.message || 'Failed to send code. Try again.';
        console.error('Send OTP error:', err);
    }

    // Re-initialize reCAPTCHA after failure
    setupRecaptcha('send-otp-button');
  } finally {
    isSending.value = false;
  }
};

// ──────── VERIFY OTP ────────
const handleVerifyOTP = async (): Promise<void> => {
  if (otpCode.value.length !== 6 || isVerifying.value) return;

  isVerifying.value = true;
  otpError.value = '';

  try {
    await verifyOTP(otpCode.value);

    // ✅ Mark as verified
    signUpData.isPhoneVerified = true;
    isOTPSent.value = false;
    otpCode.value = '';

    console.log('Phone verified successfully!');
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    switch (err.code) {
      case 'auth/invalid-verification-code':
        otpError.value = 'Wrong code. Please try again.';
        break;
      case 'auth/code-expired':
        otpError.value = 'Code expired. Please request a new one.';
        isOTPSent.value = false;
        break;
      default:
        otpError.value = err.message || 'Verification failed. Try again.';
        console.error('Verify OTP error:', err);
    }
  } finally {
    isVerifying.value = false;
  }
};

// ──────── PROCEED TO PAGE 2 ────────
const proceed = async (): Promise<void> => {
  errorMessage.value = '';

  if (!signUpData.firstName.trim()) {
    errorMessage.value = 'First name is required.';
    return;
  }
  if (!signUpData.lastName.trim()) {
    errorMessage.value = 'Last name is required.';
    return;
  }
  if (!signUpData.isPhoneVerified) {
    errorMessage.value = 'Please verify your phone number first.';
    return;
  }
  if (!signUpData.email.trim()) {
    errorMessage.value = 'Email is required.';
    return;
  }
  if (signUpData.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters.';
    return;
  }
  if (signUpData.password !== signUpData.confirmPassword) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  await router.push({ name: 'signUpScreenSecond' });
};
</script>

<style scoped src="src/features/signUpPage/SignUpScreen.css"></style>

<style scoped>
/* ══════════ PHONE INPUT ══════════ */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.country-code {
  font-weight: bold;
  font-size: 14px;
  color: #333;
  padding: 8px 0;
  white-space: nowrap;
}

.phone-input {
  flex: 1;
}

/* ══════════ SEND OTP BUTTON ══════════ */
.send-otp-btn {
  width: 70px !important;
  min-width: 70px !important;
  height: 40px !important;
  border-radius: 8px !important;
  background-color: #0e255c !important;
  color: white !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer;
  margin: 0 !important;
  padding: 0 !important;
}

.send-otp-btn:disabled {
  background-color: #a0a0a0 !important;
  cursor: not-allowed;
}

.send-otp-btn.verified {
  background-color: #27ae60 !important;
  width: 45px !important;
  min-width: 45px !important;
}

/* ══════════ OTP INPUT ══════════ */
.otp-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.otp-input {
  flex: 1;
  text-align: center;
  letter-spacing: 8px;
  font-size: 18px !important;
  font-weight: bold;
}

.verify-otp-btn {
  width: 80px !important;
  min-width: 80px !important;
  height: 40px !important;
  border-radius: 8px !important;
  background-color: #27ae60 !important;
  color: white !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer;
  margin: 0 !important;
  padding: 0 !important;
}

.verify-otp-btn:disabled {
  background-color: #a0a0a0 !important;
  cursor: not-allowed;
}

/* ══════════ VERIFIED MESSAGE ══════════ */
.verified-message {
  color: #27ae60;
  font-size: 13px;
  font-weight: 600;
  padding: 0 10px;
}

/* ══════════ RESEND ══════════ */
.resend-text {
  font-size: 11px;
  color: #888;
  margin-top: 6px;
  cursor: pointer;
}

.resend-link {
  color: #4a90d9;
  font-weight: 600;
}

/* ══════════ ERROR ══════════ */
.error-text {
  color: #e74c3c;
  font-size: 11px;
  margin-top: 4px;
  margin-bottom: 0;
  text-align: center;
}
</style>
