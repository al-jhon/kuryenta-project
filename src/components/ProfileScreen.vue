<!-- src\components\ProfileScreen.vuee -->
<template>
  <button style="margin-top: 100px;" @click="logOut">
    this is the button log out
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const logOut = async (): Promise<void> => {
  // ✅ Remove login state BEFORE navigating
  localStorage.removeItem('isAuthenticated');

  await router.replace('/welcomeScreen').catch((error) => {
    console.error('Error navigating:', error);
  });
};
</script>
