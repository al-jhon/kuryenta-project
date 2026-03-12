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
              <!-- Show captured photo or placeholder -->
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
                <a class="link" href="#" @click.prevent>Terms of Service</a>
                and the
                <a class="link" href="#" @click.prevent>Privacy Policy</a>.
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

// Can only create account when:
// 1. Face photo taken ✅
// 2. Consent checked ✅
// 3. Not currently loading
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

// ──────── CAMERA ────────
const openCamera = (): void => {
  isCameraOpen.value = true;
};

const onPhotoCaptured = (url: string): void => {
  signUpData.profilePictureUrl = url;
  console.log('Profile photo URL:', url);
};

// ──────── CREATE ACCOUNT ────────
const createAccount = async (): Promise<void> => {
  if (!canCreate.value) return;

  // Extra validation
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
      profilePictureUrl: signUpData.profilePictureUrl, // ✅ Face photo
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
        console.error('Sign up error:', firebaseError);
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
</style>
