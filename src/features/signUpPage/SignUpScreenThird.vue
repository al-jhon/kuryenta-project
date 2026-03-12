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
          <!-- PROFILE SECTION -->
          <div class="profile-section">
            <div class="avatar-wrapper">
              <div class="avatar">
                <svg class="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#B0B0B0" />
                  <path d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22C2.91 22.28 3.13 22.5 3.41 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z" fill="#B0B0B0" />
                </svg>
              </div>
              <div class="verified-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#4A90D9" />
                  <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <!-- INFO TEXT -->
          <div class="info-section">
            <p class="info-text">
              If you have any questions or concerns about your data privacy or
              our policies, please contact us at
              <a class="email-link" href="mailto:kuryenta@gmail.com">kuryenta@gmail.com</a>.
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
                <svg v-if="isConsented" class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="checkbox-text">
                I agree to the data consent agreement and will proceed with
                creating my account, acknowledging that I have read and accepted the
                <a class="link" href="#" @click.prevent>Terms of Service</a>
                and the
                <a class="link" href="#" @click.prevent>Privacy Policy</a>.
              </span>
            </label>
          </div>

          <!-- ERROR MESSAGE -->
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <!-- CREATE ACCOUNT BUTTON -->
          <button
            class="create-account-btn"
            :class="{ disabled: !isConsented || isLoading }"
            :disabled="!isConsented || isLoading"
            @click="createAccount"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signUpUser } from 'src/firebase/authService';
import { signUpData, resetSignUpData } from 'src/stores/signUpStore';

const router = useRouter();

const isConsented = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const goBack = (): void => {
  router.back();
};

const createAccount = async (): Promise<void> => {
  if (!isConsented.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // ✅ This creates the user in Firebase Auth + saves data to Firestore
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
    });

    // ✅ Clear stored sign-up data
    resetSignUpData();

    // ✅ Show success and navigate to login
    alert('Account created successfully! Please log in.');
    await router.push({ name: 'logInScreen' });

  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    // ✅ Handle specific Firebase errors
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
        errorMessage.value = firebaseError.message || 'An error occurred. Please try again.';
        console.error('Sign up error:', firebaseError);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped src="src/features/signUpPage/SignUpScreenThird.css"></style>

<style scoped>
.error-text {
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 5px 20px;
}
</style>
