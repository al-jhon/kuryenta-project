<!-- src/features/signUpPage/SignUpScreenThird.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="Kuryenta Logo" />

        <div class="div-container">

          <!-- PROFILE PHOTO SECTION -->
          <div class="profile-section">
            <div class="avatar-wrapper" @click="openCamera">
              <div class="avatar">
                <img
                  v-if="signUpData.profilePictureUrl"
                  :src="signUpData.profilePictureUrl"
                  alt="Profile"
                  class="avatar-image"
                />
                <svg
                  v-else
                  class="avatar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    fill="#B0B0B0"
                  />
                  <path
                    d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22C2.91 22.28 3.13 22.5 3.41 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z"
                    fill="#B0B0B0"
                  />
                </svg>
              </div>

              <!-- Camera badge icon -->
              <div class="camera-badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 19C23 19.53 22.79 20.04 22.41 20.41C22.04 20.79 21.53 21 21 21H3C2.47 21 1.96 20.79 1.59 20.41C1.21 20.04 1 19.53 1 19V8C1 7.47 1.21 6.96 1.59 6.59C1.96 6.21 2.47 6 3 6H7L9 3H15L17 6H21C21.53 6 22.04 6.21 22.41 6.59C22.79 6.96 23 7.47 23 8V19Z"
                    stroke="white" stroke-width="2"
                  />
                  <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2" />
                </svg>
              </div>
            </div>

            <!-- Status text -->
            <p v-if="!signUpData.profilePictureUrl" class="photo-hint">
              Tap to take your profile photo
            </p>
            <p v-else class="photo-hint verified">
              ✓ Photo captured
              <span class="retake-link" @click="openCamera">Retake</span>
            </p>
          </div>

          <!-- INFO TEXT -->
          <div class="info-section">
            <p class="info-text">
              Your face photo is required for identity verification.
              This helps us ensure the security of all users. If you have
              any questions, contact us at
              <a class="email-link" href="mailto:kuryenta@gmail.com">
                kuryenta@gmail.com</a>.
            </p>
          </div>

          <!-- CONSENT CHECKBOX -->
          <div class="consent-section">
            <label class="checkbox-label" for="consent">
              <input
                v-model="isConsented"
                type="checkbox"
                name="consent"
                id="consent"
                class="checkbox-input"
              />
              <span class="checkbox-custom">
                <svg
                  v-if="isConsented"
                  class="check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12L10 17L19 7"
                    stroke="white"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="checkbox-text">
                I agree to the data consent agreement and will proceed with
                creating my account, acknowledging that I have read and accepted
                the
                <a class="link" href="#" @click.prevent="openTos">Terms of Service</a>
                and the
                <a class="link" href="#" @click.prevent="openPrivacy">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <!-- ERROR -->
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <!-- CREATE ACCOUNT BUTTON -->
          <button
            class="create-account-btn"
            :class="{ disabled: !canCreate }"
            :disabled="!canCreate"
            @click="createAccount"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>

        <!-- CAMERA COMPONENT -->
        <CameraFaceCapture
          :isOpen="isCameraOpen"
          @close="isCameraOpen = false"
          @captured="onPhotoCaptured"
        />
      </div>
    </q-page-container>
  </q-layout>

  <!-- ═══════════════════════════════════════════════
       TERMS OF SERVICE MODAL
  ═══════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isTosOpen" class="policy-overlay" @click.self="closeTos">
        <div class="policy-modal">
          <!-- Header -->
          <div class="policy-header tos-header">
            <div class="policy-header-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <polyline points="10,9 9,9 8,9" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="policy-header-text">
              <p class="policy-label">KURYENTA</p>
              <h2 class="policy-title">Terms of Service</h2>
            </div>
            <button class="policy-close-btn" @click="closeTos">
              <svg viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="policy-body">
            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">⚡</span> Purpose
              </h3>
              <p class="section-text">
                Kuryenta provides a mobile application interface for renting detachable solar-powered units.
              </p>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">👤</span> User Eligibility
              </h3>
              <p class="section-text">
                Users must register an account and provide accurate personal information to use the service.
              </p>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">📋</span> Rental Rules
              </h3>
              <ul class="policy-list">
                <li>Units have a maximum rental duration of <strong>12 hours</strong>.</li>
                <li>Overdue alerts will be sent every 10 minutes after the limit expires.</li>
                <li>Any unused power upon return will be calculated as credits in your mobile account.</li>
              </ul>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">📍</span> Security, Tracking &amp; Penalties
              </h3>
              <p class="section-text">
                Each unit is equipped with <strong>GPS and GSM modules</strong> for real-time tracking.
              </p>
            </div>

            <div class="policy-section warning-section">
              <h3 class="section-title warning-title">
                <span class="section-icon">⚠️</span> Failure to Return
              </h3>
              <p class="section-text">
                Failure to return the unit within the specified timeframe constitutes a <strong>breach of contract</strong> and may be treated as theft.
              </p>
            </div>

            <div class="policy-section warning-section">
              <h3 class="section-title warning-title">
                <span class="section-icon">⚖️</span> Legal Action
              </h3>
              <p class="section-text">
                Kuryenta reserves the right to file formal <strong>criminal or civil charges</strong> against users who do not return equipment.
              </p>
            </div>

            <div class="policy-section warning-section">
              <h3 class="section-title warning-title">
                <span class="section-icon">📢</span> Public Disclosure
              </h3>
              <p class="section-text">
                In the event of theft or non-return, Kuryenta reserves the right to release the user's <strong>identity and likeness on social media platforms</strong> and other public forums to assist in unit recovery.
              </p>
            </div>

            <div class="policy-section warning-section">
              <h3 class="section-title warning-title">
                <span class="section-icon">🚫</span> Permanent Ban
              </h3>
              <p class="section-text">
                Any user involved in the loss or theft of a unit will be <strong>permanently banned</strong> from using Kuryenta services in the future.
              </p>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">💰</span> Payment
              </h3>
              <p class="section-text">
                Payments are handled via a coin-operated mechanism or app-based credits. No physical change is dispensed; excess payments are <strong>credited to your account</strong>.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="policy-footer">
            <button class="policy-agree-btn" @click="closeTos">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ═══════════════════════════════════════════════
       PRIVACY POLICY MODAL
  ═══════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isPrivacyOpen" class="policy-overlay" @click.self="closePrivacy">
        <div class="policy-modal">
          <!-- Header -->
          <div class="policy-header privacy-header">
            <div class="policy-header-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 22S4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9,12 11,14 15,10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="policy-header-text">
              <p class="policy-label">KURYENTA</p>
              <h2 class="policy-title">Privacy Policy</h2>
            </div>
            <button class="policy-close-btn" @click="closePrivacy">
              <svg viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="policy-body">
            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">📂</span> Information We Collect
              </h3>
              <p class="section-text">To provide rental services and verify your account, we collect:</p>
              <ul class="policy-list">
                <li><strong>Personal Information:</strong> Full name, gender, and birthdate.</li>
                <li><strong>Contact &amp; Location:</strong> Email address, home address, and mobile phone number for SMS verification.</li>
                <li><strong>User Likeness:</strong> Photographic identification or profile photos provided during registration.</li>
              </ul>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">🔍</span> How We Use Your Data
              </h3>
              <ul class="policy-list">
                <li><strong>Verification:</strong> To ensure only registered community residents access the power units.</li>
                <li><strong>Service Delivery:</strong> To manage rental transactions, track active rentals, and notify you of overdue units.</li>
                <li><strong>Security &amp; Enforcement:</strong> GPS data is monitored to prevent theft. In cases of non-return, your personal data and likeness may be used for recovery efforts.</li>
              </ul>
            </div>

            <div class="policy-section">
              <h3 class="section-title">
                <span class="section-icon">☁️</span> Data Storage
              </h3>
              <p class="section-text">
                Your account information and transaction history are stored <strong>securely in our cloud-based database</strong>.
              </p>
            </div>

            <div class="policy-section warning-section">
              <h3 class="section-title warning-title">
                <span class="section-icon">⚠️</span> Disclosure &amp; Public Release
              </h3>
              <p class="section-text">
                <strong>Important:</strong> We generally do not share your personal details with third parties. However, in the event of a failure to return equipment, theft, or breach of the Terms of Service, Kuryenta reserves the express right to:
              </p>
              <ul class="policy-list">
                <li>Disclose your information to <strong>law enforcement</strong> for the purpose of filing a legal case.</li>
                <li>Post your <strong>name and likeness (photo)</strong> on social media platforms and public bulletins to assist in the recovery of the unit.</li>
                <li>Share your identity with our <strong>affiliate network</strong> to enforce a permanent service ban.</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="policy-footer">
            <button class="policy-agree-btn" @click="closePrivacy">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signUpUser } from 'src/firebase/authService';
import { signUpData, resetSignUpData } from 'src/stores/signUpStore';
import CameraFaceCapture from 'src/components/CameraFaceCapture.vue';

const router = useRouter();

const isConsented = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const isCameraOpen = ref(false);

// Modal state
const isTosOpen = ref(false);
const isPrivacyOpen = ref(false);

const canCreate = computed(() => {
  return (
    signUpData.profilePictureUrl !== '' &&
    isConsented.value &&
    !isLoading.value
  );
});

const goBack = (): void => {
  router.back();
};

// ──────── MODALS ────────
const openTos = (): void => {
  isTosOpen.value = true;
};
const closeTos = (): void => {
  isTosOpen.value = false;
};
const openPrivacy = (): void => {
  isPrivacyOpen.value = true;
};
const closePrivacy = (): void => {
  isPrivacyOpen.value = false;
};

// ──────── CAMERA ────────
const openCamera = (): void => {
  isCameraOpen.value = true;
};

const onPhotoCaptured = (url: string): void => {
  signUpData.profilePictureUrl = url;
};

// ──────── CREATE ACCOUNT ────────
const createAccount = async (): Promise<void> => {
  if (!canCreate.value) return;

  if (!signUpData.profilePictureUrl) {
    errorMessage.value = 'Please take your profile photo first.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await signUpUser({
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      phoneNumber: signUpData.phoneNumber,
      email: signUpData.email,
      password: signUpData.password,
      sex: signUpData.sex,
      birthdate: signUpData.birthdate,
      province: signUpData.province,
      municipality: signUpData.municipality,
      barangay: signUpData.barangay,
      profilePictureUrl: signUpData.profilePictureUrl,
    });

    resetSignUpData();
    alert('Account created successfully! Please log in.');
    await router.push({ name: 'logInScreen' });

  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        errorMessage.value = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage.value = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage.value = 'Password must be at least 6 characters.';
        break;
      default:
        errorMessage.value = firebaseError.message || 'An error occurred.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped src="src/features/signUpPage/SignUpScreenThird.css"></style>

<style scoped>
/* ── PROFILE PHOTO ── */
.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #ccc;
  transition: border-color 0.3s;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-wrapper:hover .avatar {
  border-color: #0e255c;
}

.avatar-icon {
  width: 50px;
  height: 50px;
}

.camera-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #0e255c;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.camera-badge svg {
  width: 14px;
  height: 14px;
}

.photo-hint {
  font-size: 12px;
  color: #888;
  margin: 8px 0 0 0;
  text-align: center;
}

.photo-hint.verified {
  color: #27ae60;
  font-weight: 600;
}

.retake-link {
  color: #4a90d9;
  cursor: pointer;
  margin-left: 5px;
  font-weight: 400;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 5px 20px;
}

/* ══════════════════════════════════════════
   POLICY MODAL — SHARED STYLES
══════════════════════════════════════════ */
.policy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}

.policy-modal {
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(14, 37, 92, 0.25);
}

/* ── Header ── */
.policy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 18px;
  flex-shrink: 0;
}

.tos-header {
  background: linear-gradient(135deg, #0e255c 0%, #1a3d8f 100%);
}

.privacy-header {
  background: linear-gradient(135deg, #0e255c 0%, #163370 60%, #1a4a8a 100%);
}

.policy-header-icon {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.policy-header-icon svg {
  width: 22px;
  height: 22px;
}

.policy-header-text {
  flex: 1;
}

.policy-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 2px;
  margin: 0 0 2px 0;
  text-transform: uppercase;
}

.policy-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.policy-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}

.policy-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.policy-close-btn svg {
  width: 16px;
  height: 16px;
}

/* ── Body ── */
.policy-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 4px;
  scroll-behavior: smooth;
}

.policy-body::-webkit-scrollbar {
  width: 4px;
}

.policy-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.policy-body::-webkit-scrollbar-thumb {
  background: #c5cfe8;
  border-radius: 4px;
}

/* ── Sections ── */
.policy-section {
  padding: 14px 0;
  border-bottom: 1px solid #eef0f6;
}

.policy-section:last-child {
  border-bottom: none;
}

.warning-section {
  background: #fff8f0;
  margin: 0 -20px;
  padding: 14px 20px;
  border-left: 3px solid #e67e22;
  border-bottom: 1px solid #fde8cc;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #0e255c;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.warning-title {
  color: #c0392b;
}

.section-icon {
  font-size: 14px;
}

.section-text {
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  margin: 0;
}

.policy-list {
  margin: 6px 0 0 0;
  padding-left: 18px;
  list-style: none;
}

.policy-list li {
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 6px;
  position: relative;
  padding-left: 4px;
}

.policy-list li::before {
  content: '•';
  color: #0e255c;
  font-weight: 700;
  position: absolute;
  left: -14px;
}

.policy-list strong {
  color: #0e255c;
}

.section-text strong {
  color: #0e255c;
}

/* ── Footer ── */
.policy-footer {
  padding: 14px 20px 28px;
  flex-shrink: 0;
  background: #fff;
  border-top: 1px solid #eef0f6;
}

.policy-agree-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #0e255c, #1a3d8f);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: opacity 0.2s, transform 0.1s;
}

.policy-agree-btn:hover {
  opacity: 0.92;
}

.policy-agree-btn:active {
  transform: scale(0.98);
}

/* ── Transition ── */
.modal-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-fade-leave-active {
  transition: all 0.22s ease-in;
}

.modal-fade-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

.modal-fade-enter-from .policy-modal,
.modal-fade-leave-to .policy-modal {
  transform: translateY(100%);
}
</style>
