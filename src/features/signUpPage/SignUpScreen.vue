<!-- src/features/signUpPage/SignUpScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="/assets/Kuryenta_logo.png" alt="Kuryenta Logo" />

        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="log-in-text">Sign Up</p>
            <hr class="hr-right" />
          </div>

          <div class="second-container">
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

            <!-- PHONE (just input, no OTP) -->
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
                  @input="formatPhone"
                />
              </div>
              <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
            </div>

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
                :src="showPassword ? '/assets/eye-open.png' : '/assets/eye-close.png'"
                @click="showPassword = !showPassword"
              />
            </div>

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
                :src="showConfirmPassword ? '/assets/eye-open.png' : '/assets/eye-close.png'"
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signUpData } from 'src/stores/signUpStore';

const router = useRouter();

const phoneError = ref('');
const errorMessage = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const goBack = (): void => {
  router.back();
};

const formatPhone = (): void => {
  signUpData.phoneNumber = signUpData.phoneNumber.replace(/\D/g, '');
  if (signUpData.phoneNumber.length > 0 && signUpData.phoneNumber[0] !== '9') {
    signUpData.phoneNumber = '';
    phoneError.value = 'Philippine number must start with 9';
    return;
  }
  if (signUpData.phoneNumber.length > 0 && signUpData.phoneNumber.length < 10) {
    phoneError.value = 'Must be 10 digits (e.g. 9171234567)';
  } else {
    phoneError.value = '';
  }
};

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
  if (!/^9\d{9}$/.test(signUpData.phoneNumber)) {
    phoneError.value = 'Enter a valid Philippine number (e.g. 9171234567)';
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
.error-text {
  color: #e74c3c;
  font-size: 11px;
  margin-top: 4px;
  margin-bottom: 0;
  text-align: center;
}
</style>
