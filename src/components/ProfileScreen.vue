<!-- src\components\ProfileScreen.vue -->
<template>
  <div class="profile-page">

    <!-- ── HERO HEADER ─────────────────────────────── -->
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-grid"></div>

      <!-- Avatar -->
      <div class="avatar-ring" @click="openCamera">
        <div class="avatar-pulse"></div>
        <div class="avatar-wrap">
          <img
            v-if="userData?.profilePictureUrl"
            :src="userData.profilePictureUrl"
            alt="Profile photo"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="none" class="placeholder-svg">
              <path
                d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"
                fill="currentColor"
              />
              <path
                d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22C2.91 22.28 3.13 22.5 3.41 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <button class="edit-photo-btn" @click.stop="openCamera">
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path
              d="M23 19C23 19.53 22.79 20.04 22.41 20.41C22.04 20.79 21.53 21 21 21H3C2.47 21 1.96 20.79 1.59 20.41C1.21 20.04 1 19.53 1 19V8C1 7.47 1.21 6.96 1.59 6.59C1.96 6.21 2.47 6 3 6H7L9 3H15L17 6H21C21.53 6 22.04 6.21 22.41 6.59C22.79 6.96 23 7.47 23 8V19Z"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            />
            <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2" />
          </svg>
        </button>
      </div>

      <!-- Name + Credits -->
      <div class="hero-info">
        <h1 class="hero-name" v-if="userData">
          {{ userData.firstName }} {{ userData.lastName }}
        </h1>
        <div v-else class="skeleton name-skeleton"></div>

        <div class="credits-chip">
          <span class="credits-bolt">⚡</span>
          <span class="credits-val">{{ creditPoints.toLocaleString() }}</span>
          <span class="credits-tag">Credit Points</span>
        </div>
      </div>

      <!-- Curved bottom -->
      <svg class="hero-curve" viewBox="0 0 390 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 48 Q195 0 390 48 L390 48 L0 48Z" fill="#0A1628" />
      </svg>
    </div>

    <!-- ── CARDS ────────────────────────────────────── -->
    <div class="cards">

      <!-- Personal Info -->
      <div class="card" :class="{ loaded: isLoaded }">
        <div class="card-label">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <circle cx="10" cy="7" r="3.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Personal Info
        </div>
        <div class="field-row">
          <span class="field-key">Full Name</span>
          <span class="field-val">{{ userData ? `${userData.firstName} ${userData.lastName}` : '—' }}</span>
        </div>
        <div class="divider" />
        <div class="field-row">
          <span class="field-key">Birthday</span>
          <span class="field-val">{{ formatBirthdate(userData?.birthdate) }}</span>
        </div>
        <div class="divider" />
        <div class="field-row">
          <span class="field-key">Sex</span>
          <span class="field-val">{{ userData?.sex || '—' }}</span>
        </div>
      </div>

      <!-- Contact -->
      <div class="card" :class="{ loaded: isLoaded }" style="animation-delay: 0.08s">
        <div class="card-label">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="10" cy="7" r="1" fill="currentColor"/>
          </svg>
          Contact
        </div>
        <div class="field-row">
          <span class="field-key">Phone</span>
          <span class="field-val">{{ userData?.phoneNumber || '—' }}</span>
        </div>
        <div class="divider" />
        <div class="field-row">
          <span class="field-key">Email</span>
          <span class="field-val email-truncate">{{ userData?.email || '—' }}</span>
        </div>
      </div>

      <!-- Location -->
      <div class="card" :class="{ loaded: isLoaded }" style="animation-delay: 0.16s">
        <div class="card-label">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Location
        </div>
        <div class="field-row">
          <span class="field-key">Barangay</span>
          <span class="field-val">{{ userData?.barangay || '—' }}</span>
        </div>
        <div class="divider" />
        <div class="field-row">
          <span class="field-key">Municipality</span>
          <span class="field-val">{{ userData?.municipality || '—' }}</span>
        </div>
        <div class="divider" />
        <div class="field-row">
          <span class="field-key">Province</span>
          <span class="field-val">{{ userData?.province || '—' }}</span>
        </div>
      </div>

      <!-- Log Out -->
      <button class="logout-btn" @click="logOut" :disabled="isLoggingOut">
        <svg v-if="!isLoggingOut" viewBox="0 0 20 20" fill="none" width="17" height="17">
          <path d="M13 15l4-4-4-4M17 11H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>{{ isLoggingOut ? 'Logging out…' : 'Log Out' }}</span>
      </button>

    </div>

    <!-- Camera Component -->
    <CameraFaceCapture
      :isOpen="isCameraOpen"
      @close="isCameraOpen = false"
      @captured="onPhotoCaptured"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logOutUser, getUserData, type UserData } from 'src/firebase/authService'
import { listenToCreditPoints } from 'src/firebase/realtimeService'
import { auth } from 'src/firebase/firebase'
import CameraFaceCapture from 'src/components/CameraFaceCapture.vue'
import type { Unsubscribe } from 'firebase/database'

const router = useRouter()
const userData = ref<UserData | null>(null)
const creditPoints = ref(0)
const isLoggingOut = ref(false)
const isCameraOpen = ref(false)
const isLoaded = ref(false)

let unsubCredits: Unsubscribe | null = null

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return
  userData.value = await getUserData(user.uid)
  unsubCredits = listenToCreditPoints(user.uid, (val) => {
    creditPoints.value = val
  })
  // Trigger card animation after data loads
  setTimeout(() => { isLoaded.value = true }, 50)
})

onUnmounted(() => {
  if (unsubCredits) unsubCredits()
})

const formatBirthdate = (raw?: string): string => {
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return raw
  }
}

const openCamera = () => { isCameraOpen.value = true }

const onPhotoCaptured = (url: string) => {
  if (userData.value) userData.value.profilePictureUrl = url
}

const logOut = async () => {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await logOutUser()
    await router.replace('/welcomeScreen')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* ── GOOGLE FONT IMPORT (add to index.html or quasar.config if not present) ──
   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
   ────────────────────────────────────────────────────────────────────────── */

/* ── PAGE ──────────────────────────────────────────────── */
.profile-page {
  min-height: 100vh;
  background: #0A1628;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  padding-bottom: 40px;
}

/* ── HERO ──────────────────────────────────────────────── */
.hero {
  position: relative;
  background: linear-gradient(160deg, #0f2a50 0%, #122240 60%, #0A1628 100%);
  padding: 56px 24px 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(0, 200, 230, 0.14) 0%, transparent 70%);
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 200, 230, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 230, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

/* ── AVATAR ─────────────────────────────────────────────── */
.avatar-ring {
  position: relative;
  width: 108px;
  height: 108px;
  cursor: pointer;
}

.avatar-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(0, 210, 230, 0.5);
  animation: pulse-ring 2.8s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
}

.avatar-wrap {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #00D4E8;
  background: #1a2f52;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 212, 232, 0.5);
}

.placeholder-svg {
  width: 48px;
  height: 48px;
}

.edit-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #00D4E8;
  border: 2px solid #0A1628;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.edit-photo-btn:hover {
  background: #00f0ff;
}

/* ── HERO INFO ──────────────────────────────────────────── */
.hero-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.hero-name {
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
  margin: 0;
  text-align: center;
}

.name-skeleton {
  height: 28px;
  width: 180px;
  background: linear-gradient(90deg, #1a2f52 25%, #203660 50%, #1a2f52 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.credits-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 212, 232, 0.12);
  border: 1px solid rgba(0, 212, 232, 0.35);
  border-radius: 999px;
  padding: 5px 14px;
}

.credits-bolt {
  font-size: 13px;
  line-height: 1;
}

.credits-val {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #00D4E8;
}

.credits-tag {
  font-size: 12px;
  color: rgba(0, 212, 232, 0.7);
}

.hero-curve {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 48px;
}

/* ── CARDS ──────────────────────────────────────────────── */
.cards {
  padding: 24px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  background: #112240;
  border: 1px solid rgba(0, 212, 232, 0.15);
  border-radius: 16px;
  padding: 18px 20px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.card.loaded {
  opacity: 1;
  transform: translateY(0);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00D4E8;
  margin-bottom: 16px;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  gap: 12px;
}

.field-key {
  font-size: 13px;
  color: rgba(180, 200, 230, 0.55);
  white-space: nowrap;
  flex-shrink: 0;
}

.field-val {
  font-size: 14px;
  color: #dce8ff;
  font-weight: 500;
  text-align: right;
}

.email-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.divider {
  height: 1px;
  background: rgba(0, 212, 232, 0.08);
  margin: 2px 0;
}

/* ── LOG OUT ────────────────────────────────────────────── */
.logout-btn {
  margin-top: 8px;
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 85, 85, 0.4);
  background: rgba(255, 50, 50, 0.06);
  color: #ff6b6b;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  margin-bottom: 90px;
}

.logout-btn:hover:not(:disabled) {
  background: rgba(255, 50, 50, 0.14);
  border-color: rgba(255, 85, 85, 0.7);
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── SKELETON ───────────────────────────────────────────── */
.skeleton {
  background: linear-gradient(90deg, #1a2f52 25%, #203660 50%, #1a2f52 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
</style>
