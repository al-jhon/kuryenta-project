<!-- LogInScreen.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="" />
        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="log-in-text">LOG IN</p>
            <hr class="hr-right" />
          </div>
          <div class="second-container">
            <div class="input-group">
              <label class="label">Email address</label>
              <input autocomplete="off" name="Email" id="Email" class="input" type="email" />
            </div>
            <div class="input-group-password">
              <label class="label">Password</label>
              <input
                autocomplete="off"
                name="Password"
                id="Password"
                class="input"
                type="password"
              />
              <img class="eye" id="eye" src="src/assets/eye-close.png" alt="eye-close" />
              <p class="forgot-password">Forgot Password?</p>
            </div>
            <button @click="logIn">Log In</button>
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
import { onMounted } from 'vue';

const logIn = async (): Promise<void> => {
  // ✅ Save login state BEFORE navigating
  localStorage.setItem('isAuthenticated', 'true');

  await router.replace('/mainScreen').catch((error) => {
    console.error('Error navigating:', error);
  });
};

// const logIn = (): void => {
//   window.location.replace('/#/homeScreen');
// };

onMounted(() => {
  const eye = document.getElementById('eye') as HTMLImageElement;
  const password = document.getElementById('Password') as HTMLInputElement;

  eye?.addEventListener('click', function () {
    if (password.type === 'password') {
      password.type = 'text';
      eye.src = 'src/assets/eye-open.png';
    } else {
      password.type = 'password';
      eye.src = 'src/assets/eye-close.png';
    }
  });
});
</script>

<style lang="css" src="src/features/LogInPage/LogInScreen.css" />
