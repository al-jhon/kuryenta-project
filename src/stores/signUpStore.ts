// src/stores/signUpStore.ts
import { reactive } from 'vue';

const signUpData = reactive({
  // Page 1
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  isPhoneVerified: false, // ✅ NEW

  // Page 2
  sex: '',
  birthdate: '',
  province: '',
  municipality: '',
  barangay: '',
});

const resetSignUpData = (): void => {
  signUpData.firstName = '';
  signUpData.lastName = '';
  signUpData.phoneNumber = '';
  signUpData.email = '';
  signUpData.password = '';
  signUpData.confirmPassword = '';
  signUpData.isPhoneVerified = false; // ✅ NEW
  signUpData.sex = '';
  signUpData.birthdate = '';
  signUpData.province = '';
  signUpData.municipality = '';
  signUpData.barangay = '';
};

export { signUpData, resetSignUpData };
