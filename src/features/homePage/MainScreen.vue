<!-- MainScreen.vue -->
<template>
  <div class="body">
    <router-view />

    <div class="footer">
      <!-- HOME -->
      <router-link :to="{ name: 'home' }" custom v-slot="{ navigate, isExactActive }">
        <div class="footer-item" :class="{ active: isExactActive }" @click="navigate">
          <div class="icon-bubble">
            <img class="footer-icon" src="src/assets/home.png" alt="home" />
          </div>
          <span class="footer-label">Home</span>
        </div>
      </router-link>

      <!-- NOTIFICATIONS (no route yet — stays as plain div) -->
      <div class="footer-item" @click="onNotificationClick">
        <div class="icon-bubble">
          <img class="footer-icon" src="src/assets/notification.png" alt="notification" />
        </div>
        <span class="footer-label">Alerts</span>
      </div>

      <!-- PROFILE -->
      <router-link :to="{ name: 'profile' }" custom v-slot="{ navigate, isExactActive }">
        <div class="footer-item" :class="{ active: isExactActive }" @click="navigate">
          <div class="icon-bubble">
            <img class="footer-icon" src="src/assets/user-icon.png" alt="profile" />
          </div>
          <span class="footer-label">Profile</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const onNotificationClick = () => {
  // TODO: wire up when notification route is ready
};
</script>

<style scoped src="src/features/homePage/Footer.css"></style>
<style scoped src="src/features/homePage/Screen.css"></style>
