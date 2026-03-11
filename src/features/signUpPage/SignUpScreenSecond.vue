<!-- src/features/signUpPage/SignUpScreenSecond.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="background">
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
            <!-- SEX -->
            <div class="input-group">
              <label class="label">Sex</label>
              <div class="sex-options">
                <label class="radio-label" for="male">
                  <input v-model="signUpData.sex" type="radio" name="sex" id="male" value="Male" />
                  <span class="radio-custom"></span>
                  Male
                </label>
                <label class="radio-label" for="female">
                  <input v-model="signUpData.sex" type="radio" name="sex" id="female" value="Female" />
                  <span class="radio-custom"></span>
                  Female
                </label>
              </div>
            </div>

            <!-- BIRTHDATE -->
            <div class="input-group">
              <label class="label" for="birthdate">Birthdate</label>
              <input
                v-model="signUpData.birthdate"
                name="birthdate"
                id="birthdate"
                class="input"
                type="date"
                :max="maxDate"
              />
            </div>

            <!-- PROVINCE -->
            <div class="input-group">
              <label class="label" for="province">Province</label>
              <input
                v-model="signUpData.province"
                autocomplete="address-level1"
                name="province"
                id="province"
                class="input"
                type="text"
              />
            </div>

            <!-- MUNICIPALITY -->
            <div class="input-group">
              <label class="label" for="municipality">Municipality / City</label>
              <input
                v-model="signUpData.municipality"
                autocomplete="address-level2"
                name="municipality"
                id="municipality"
                class="input"
                type="text"
              />
            </div>

            <!-- BARANGAY -->
            <div class="input-group">
              <label class="label" for="barangay">Barangay</label>
              <input
                v-model="signUpData.barangay"
                autocomplete="address-level3"
                name="barangay"
                id="barangay"
                class="input"
                type="text"
              />
            </div>

            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
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
import { signUpData } from 'src/stores/signUpStore';

const router = useRouter();
const errorMessage = ref('');

const maxDate = computed(() => new Date().toISOString().split('T')[0]);

const goBack = (): void => {
  router.back();
};

const proceed = async (): Promise<void> => {
  errorMessage.value = '';

  if (!signUpData.sex) {
    errorMessage.value = 'Please select your sex.';
    return;
  }
  if (!signUpData.birthdate) {
    errorMessage.value = 'Please enter your birthdate.';
    return;
  }
  if (!signUpData.province.trim()) {
    errorMessage.value = 'Please enter your province.';
    return;
  }
  if (!signUpData.municipality.trim()) {
    errorMessage.value = 'Please enter your municipality.';
    return;
  }
  if (!signUpData.barangay.trim()) {
    errorMessage.value = 'Please enter your barangay.';
    return;
  }

  await router.push({ name: 'signUpScreenThird' });
};
</script>

<style scoped src="src/features/signUpPage/SignUpScreenSecond.css"></style>

<style scoped>
.error-text {
  color: #e74c3c;
  font-size: 11px;
  margin-top: 4px;
  margin-bottom: 0;
  text-align: center;
}
</style>
