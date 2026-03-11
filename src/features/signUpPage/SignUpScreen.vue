<!-- src\features\signUpPage\SignUpScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <!-- BACK BUTTON -->
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
            <div class="input-group">
              <label class="label" for="firstName">First Name</label>
              <input
                v-model="firstName"
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
                v-model="lastName"
                autocomplete="family-name"
                name="lastName"
                id="lastName"
                class="input"
                type="text"
              />
            </div>

            <div class="input-group">
              <label class="label" for="phoneNumber">Phone Number</label>
              <div class="phone-input-wrapper">
                <span class="country-code">+63</span>
                <input
                  v-model="phoneNumber"
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

            <div class="input-group-password">
              <label class="label" for="confirmPassword">Confirm Password</label>
              <input
                v-model="confirmPassword"
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

            <button @click="signUp">Proceed</button>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const phoneNumber = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const phoneError = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const goBack = (): void => {
  router.back();
};

const formatPhone = (): void => {
  phoneNumber.value = phoneNumber.value.replace(/\D/g, '');
  if (phoneNumber.value.length > 0 && phoneNumber.value[0] !== '9') {
    phoneNumber.value = '';
    phoneError.value = 'Philippine number must start with 9';
    return;
  }
  if (phoneNumber.value.length > 0 && phoneNumber.value.length < 10) {
    phoneError.value = 'Must be 10 digits (e.g. 9171234567)';
  } else {
    phoneError.value = '';
  }
};

const isValidPhPhone = (phone: string): boolean => {
  const phRegex = /^9\d{9}$/;
  return phRegex.test(phone);
};

const signUp = async (): Promise<void> => {
  if (!isValidPhPhone(phoneNumber.value)) {
    phoneError.value = 'Enter a valid Philippine number (e.g. 9171234567)';
    return;
  }
  await router.push({ name: 'signUpScreenSecond' }).catch((error) => {
    console.error('Error navigating:', error);
  });
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
}
</style>
