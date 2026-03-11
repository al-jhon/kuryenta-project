<!-- src\features\logInPage\LogInScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <!-- BACK BUTTON -->
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="" />
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
                :src="showPassword ? 'src/assets/eye-open.png' : 'src/assets/eye-close.png'"
                :alt="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              />
              <p class="forgot-password">Forgot Password?</p>
            </div>
            <button @click="logIn">Log In</button>
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

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const goBack = (): void => {
  router.back();
};

const logIn = async (): Promise<void> => {
  localStorage.setItem('isAuthenticated', 'true');
  await router.replace('/mainScreen').catch((error) => {
    console.error('Error navigating:', error);
  });
};
</script>

<style scoped lang="css" src="src/features/logInPage/LogInScreen.css" />
