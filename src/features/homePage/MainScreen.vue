<!-- MainScreen.vue -->
<template>
  <div class="body">
    <router-view />

    <div class="footer">
      <div class="footer-item" :class="{ active: activeTab === 'home' }" @click="setActive('home')">
        <div class="icon-bubble">
          <img class="footer-icon" src="src/assets/home.png" alt="home" />
        </div>
        <span class="footer-label">Home</span>
      </div>

      <div
        class="footer-item"
        :class="{ active: activeTab === 'notification' }"
        @click="setActive('notification')"
      >
        <div class="icon-bubble">
          <img class="footer-icon" src="src/assets/notification.png" alt="notification" />
        </div>
        <span class="footer-label">Alerts</span>
      </div>

      <div
        class="footer-item"
        :class="{ active: activeTab === 'profile' }"
        @click="setActive('profile')"
      >
        <div class="icon-bubble">
          <img class="footer-icon" src="src/assets/user-icon.png" alt="profile" />
        </div>
        <span class="footer-label">Profile</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<string>('home');

const setActive = (tab: string): void => {
  activeTab.value = tab;
};
</script>

<style src="src/features/homePage/Footer.css"></style>
<style src="src/features/homePage/Screen.css"></style>
