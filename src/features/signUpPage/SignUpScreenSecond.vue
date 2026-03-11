<!-- SignUpScreenSecond.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
        <!-- BACK BUTTON -->
        <button class="back-button" @click="goBack">
          <span class="back-arrow"></span>
        </button>

        <img class="image-logo" src="src/assets/Kuryenta_logo.png" alt="Kuryenta Logo" />

        <div class="div-container">
          <div class="first-container">
            <hr class="hr-left" width="100%" />
            <p class="log-in-text">Sign Up</p>
            <hr class="hr-right" />
          </div>

          <div class="second-container">
            <div class="input-group">
              <label class="label">Sex</label>
              <div class="sex-options">
                <label class="radio-label" for="male">
                  <input v-model="sex" type="radio" name="sex" id="male" value="Male" />
                  <span class="radio-custom"></span>
                  Male
                </label>
                <label class="radio-label" for="female">
                  <input v-model="sex" type="radio" name="sex" id="female" value="Female" />
                  <span class="radio-custom"></span>
                  Female
                </label>
              </div>
            </div>

            <div class="input-group">
              <label class="label" for="birthdate">Birthdate</label>
              <input
                v-model="birthdate"
                name="birthdate"
                id="birthdate"
                class="input"
                type="date"
                :max="maxDate"
              />
            </div>

            <div class="input-group">
              <label class="label" for="province">Province</label>
              <input
                v-model="province"
                autocomplete="address-level1"
                name="province"
                id="province"
                class="input"
                type="text"
              />
            </div>

            <div class="input-group">
              <label class="label" for="municipality">Municipality / City</label>
              <input
                v-model="municipality"
                autocomplete="address-level2"
                name="municipality"
                id="municipality"
                class="input"
                type="text"
              />
            </div>

            <div class="input-group">
              <label class="label" for="barangay">Barangay</label>
              <input
                v-model="barangay"
                autocomplete="address-level3"
                name="barangay"
                id="barangay"
                class="input"
                type="text"
              />
            </div>

            <button @click="proceed">Proceed</button>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const sex = ref('');
const birthdate = ref('');
const province = ref('');
const municipality = ref('');
const barangay = ref('');

const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const goBack = (): void => {
  router.back();
};

const proceed = async (): Promise<void> => {
  if (!sex.value) {
    alert('Please select your sex.');
    return;
  }
  if (!birthdate.value) {
    alert('Please enter your birthdate.');
    return;
  }
  if (!province.value.trim()) {
    alert('Please enter your province.');
    return;
  }
  if (!municipality.value.trim()) {
    alert('Please enter your municipality / city.');
    return;
  }
  if (!barangay.value.trim()) {
    alert('Please enter your barangay.');
    return;
  }

  await router.push({ name: 'signUpScreenThird' }).catch((error) => {
    console.error('Error navigating:', error);
  });
};
</script>

<style scoped src="src/features/signUpPage/SignUpScreenSecond.css"></style>
