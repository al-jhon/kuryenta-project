<!-- src/features/logInPage/LogInScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="/assets/Kuryenta_logo.png" alt="" />

        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="log-in-text">LOG IN</p>
            <hr class="hr-right" />
          </div>

          <div class="second-container">
            <div class="input-group">
              <label class="label" for="email">Email address</label>
              <input
                v-model="email"
                autocomplete="email"
                name="email"
                id="email"
                class="input"
                type="email"
              />
            </div>

            <div class="input-group-password">
              <label class="label" for="password">Password</label>
              <input
                v-model="password"
                autocomplete="current-password"
                name="password"
                id="password"
                class="input"
                :type="showPassword ? 'text' : 'password'"
              />
              <img
                class="eye"
                :src="showPassword ? '/assets/eye-open.png' : '/assets/eye-close.png'"
                :alt="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              />
              <p class="forgot-password">Forgot Password?</p>
            </div>

            <!-- ERROR MESSAGE -->
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <button @click="logIn" :disabled="isLoading">
              {{ isLoading ? 'Logging in...' : 'Log In' }}
            </button>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { logInUser } from 'src/firebase/authService';

const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const goBack = (): void => {
  router.back();
};

const logIn = async (): Promise<void> => {
  if (isLoading.value) return;

  // Simple validation
  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email.';
    return;
  }
  if (!password.value) {
    errorMessage.value = 'Please enter your password.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // ✅ Firebase login
    await logInUser(email.value, password.value);

    // ✅ Navigate to main screen
    await router.replace('/mainScreen');

  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    switch (firebaseError.code) {
      case 'auth/user-not-found':
        errorMessage.value = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage.value = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage.value = 'Invalid email address.';
        break;
      case 'auth/invalid-credential':
        errorMessage.value = 'Invalid email or password.';
        break;
      case 'auth/too-many-requests':
        errorMessage.value = 'Too many failed attempts. Try again later.';
        break;
      default:
        errorMessage.value = firebaseError.message || 'Login failed. Please try again.';
        console.error('Login error:', firebaseError);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="css" src="src/features/logInPage/LogInScreen.css" />

<style scoped>
.error-text {
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 5px 0;
}
</style>
