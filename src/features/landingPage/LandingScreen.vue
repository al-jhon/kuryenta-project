<!-- LandingScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <div class="div-logo">
          <q-img class="logo" src="src/assets/Kuryenta_logo.png" />
        </div>
        <div class="div-button">
          <q-btn @click="getStarted"> Get Started </q-btn>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const getStarted = async (): Promise<void> => {
  await router.replace('/welcomeScreen').catch((error) => {
    console.error('Navigation error:', error);
  });
};
</script>

<style lang="css" src="src/features/landingPage/LandingScreen.css" />
