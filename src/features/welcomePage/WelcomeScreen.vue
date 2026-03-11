<!--src\features\welcomePage\WelcomeScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="" />
        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="welcome-text">WELCOME</p>
            <hr class="hr-right" />
          </div>
          <div class="second-container">
            <button @click="logIn">Log In</button>
            <button @click="signUp">Sign Up</button>
          </div>
        </div>
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const logIn = async (): Promise<void> => {
  await router.push('logInScreen').catch((error) => {
    console.error('Error navigating to log in screen:', error);
  });
};

const signUp = async (): Promise<void> => {
  await router.push({ name: 'signUpScreen' }).catch((error) => {
    console.error('Error Navaigating to sign up screen: ', error);
  });
};
</script>

<style scoped lang="css" src="src/features/welcomePage/WelcomeScreen.css" />
