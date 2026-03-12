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

  // Page 2
  sex: '',
  birthdate: '',
  province: '',
  municipality: '',
  barangay: '',

  // Page 3 — Face photo
  profilePictureUrl: '', // ✅ Cloudinary URL
});

const resetSignUpData = (): void => {
  signUpData.firstName = '';
  signUpData.lastName = '';
  signUpData.phoneNumber = '';
  signUpData.email = '';
  signUpData.password = '';
  signUpData.confirmPassword = '';
  signUpData.sex = '';
  signUpData.birthdate = '';
  signUpData.province = '';
  signUpData.municipality = '';
  signUpData.barangay = '';
  signUpData.profilePictureUrl = '';
};

export { signUpData, resetSignUpData };
