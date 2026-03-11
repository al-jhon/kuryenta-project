<!-- src/components/ProfileScreen.vue -->
<template>
  <div class="profile-container">
    <div v-if="userData" class="user-info">
      <h3>{{ userData.firstName }} {{ userData.lastName }}</h3>
      <p>{{ userData.email }}</p>
      <p>{{ userData.phoneNumber }}</p>
    </div>

    <button class="logout-btn" @click="logOut" :disabled="isLoading">
      {{ isLoading ? 'Logging out...' : 'Log Out' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logOutUser, getUserData, type UserData } from 'src/firebase/authService';
import { auth } from 'src/firebase/firebase';

const router = useRouter();
const isLoading = ref(false);
const userData = ref<UserData | null>(null);

// ✅ Load user data from Firestore when page opens
onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    userData.value = await getUserData(user.uid);
  }
});

const logOut = async (): Promise<void> => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    // ✅ Firebase logout
    await logOutUser();
    await router.replace('/welcomeScreen');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  gap: 20px;
}
.user-info {
  text-align: center;
}
.user-info h3 {
  margin: 0;
  color: #0e255c;
}
.user-info p {
  margin: 4px 0;
  color: #555;
  font-size: 14px;
}
.logout-btn {
  padding: 12px 24px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
