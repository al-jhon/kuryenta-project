<!-- src\features\homePage\MainScreen.vue -->
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

      <!-- ALERTS -->
      <router-link :to="{ name: 'alertsScreen' }" custom v-slot="{ navigate, isExactActive }">
        <div class="footer-item" :class="{ active: isExactActive }" @click="navigate">
          <div class="icon-bubble" style="position: relative">
            <img class="footer-icon" src="src/assets/notification.png" alt="notification" />
            <span v-if="unreadCount > 0" class="alerts-badge">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </div>
          <span class="footer-label">Alerts</span>
        </div>
      </router-link>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from 'src/firebase/firebase'
import { listenToAlerts, type AlertItem } from 'src/firebase/realtimeService'
import type { Unsubscribe } from 'firebase/database'

const unreadCount = ref(0)
let unsubAlerts: Unsubscribe | null = null

onMounted(() => {
  const user = auth.currentUser
  if (!user) return
  unsubAlerts = listenToAlerts(user.uid, (alerts: AlertItem[]) => {
    unreadCount.value = alerts.filter((a) => !a.data.view).length
  })
})

onUnmounted(() => {
  if (unsubAlerts) unsubAlerts()
})
</script>

<style scoped>
.alerts-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
  pointer-events: none;
}
</style>
<style scoped src="src/features/homePage/Footer.css"></style>
<style scoped src="src/features/homePage/Screen.css"></style>
