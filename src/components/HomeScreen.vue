<!-- src/components/HomeScreen.vue -->
<template>
  <div class="home-container">
    <div class="header">
      <div class="left-section">
        <!-- ✅ Real profile picture from Cloudinary -->
        <img v-if="profilePicture" class="profile" :src="profilePicture" alt="profile picture" />
        <!-- Fallback if no picture -->
        <div v-else class="profile profile-placeholder">
          <svg viewBox="0 0 24 24" fill="none" class="placeholder-icon">
            <path
              d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"
              fill="#B0B0B0"
            />
            <path
              d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22C2.91 22.28 3.13 22.5 3.41 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z"
              fill="#B0B0B0"
            />
          </svg>
        </div>
      </div>
      <div class="middle-section">
        <p>
          Hello, <span class="userNameClass">{{ userName }}</span
          >!
        </p>
        <p>{{ userLocation }}</p>
      </div>
      <div>
        <img class="kuryenta-logo" src="/assets/Kuryenta_logo.png" alt="Kuryenta-logo" />
      </div>
    </div>

    <div class="main-page">
      <!-- SEARCH STATION -->
      <div class="search-container">
        <input
          v-model="searchId"
          class="input-field"
          type="text"
          placeholder="Enter Station ID (e.g. 0001)"
          @keyup.enter="searchStation"
        />
        <img
          class="search-icon"
          src="/assets/search-icon.png"
          alt="search"
          @click="searchStation"
        />
      </div>

      <!-- SEARCH ERROR -->
      <p v-if="searchError" class="search-error">{{ searchError }}</p>

      <!-- CREDIT POINTS (Real-Time) -->
      <div class="credit-container">
        <div class="icons">
          <img src="/assets/credit-icon.png" alt="" />
          <p class="credit-points">Credit Points</p>
        </div>
        <div class="credit-value">
          <img src="/assets/peso-icon.png" alt="" />
          <p>{{ creditPoints }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from 'src/firebase/firebase';
import { getUserData } from 'src/firebase/authService';
import { getStation, listenToCreditPoints } from 'src/firebase/realtimeService';
import type { Unsubscribe } from 'firebase/database';

const router = useRouter();

const userName = ref('User');
const userLocation = ref('');
const profilePicture = ref(''); // ✅ ADD
const creditPoints = ref(0);
const searchId = ref('');
const searchError = ref('');

let unsubCredits: Unsubscribe | null = null;

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  // Load user profile from Firestore
  const userData = await getUserData(user.uid);
  if (userData) {
    userName.value = userData.firstName;
    userLocation.value = `${userData.barangay}, ${userData.municipality}`;
    profilePicture.value = userData.profilePictureUrl || ''; // ✅ ADD
  }

  // Listen to credit points in real-time from RTDB
  unsubCredits = listenToCreditPoints(user.uid, (credits) => {
    creditPoints.value = credits;
  });
});

onUnmounted(() => {
  if (unsubCredits) unsubCredits();
});

// ──────── SEARCH STATION ────────
const searchStation = async (): Promise<void> => {
  searchError.value = '';

  const id = searchId.value.trim();
  if (!id) {
    searchError.value = 'Please enter a Station ID.';
    return;
  }

  const station = await getStation(id);

  if (station) {
    await router.push({
      name: 'stationScreen',
      params: { stationId: id },
    });
  } else {
    searchError.value = `Station "${id}" not found.`;
  }
};
</script>

<style scoped src="src/features/homePage/Header.css"></style>
<style scoped src="src/features/homePage/MainPage.css"></style>

<style scoped>
.search-error {
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 5px 0 0 0;
}

/* ── Placeholder when no profile picture ── */
.profile-placeholder {
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.placeholder-icon {
  width: 60%;
  height: 60%;
}
</style>
