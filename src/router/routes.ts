// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/original',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  {
    path: '/',
    component: () => import('src/features/landingPage/LandingScreen.vue'),
  },

  {
    path: '/welcomeScreen',
    component: () => import('src/features/welcomePage/WelcomeScreen.vue'),
  },

  {
    path: '/logInScreen',
    name: 'logInScreen',
    component: () => import('src/features/logInPage/LogInScreen.vue'),
  },

  {
    path: '/signUpScreen',
    name: 'signUpScreen',
    component: () => import('src/features/signUpPage/SignUpScreen.vue'),
  },

  {
    path: '/signUpScreenSecond',
    name: 'signUpScreenSecond',
    component: () => import('src/features/signUpPage/SignUpScreenSecond.vue'),
  },

  {
    path: '/signUpScreenThird',
    name: 'signUpScreenThird',
    component: () => import('src/features/signUpPage/SignUpScreenThird.vue'),
  },

  {
    path: '/mainScreen',
    component: () => import('src/features/homePage/MainScreen.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/components/HomeScreen.vue'),
      },
      {
        path: 'profileScreen',
        name: 'profile',
        component: () => import('src/components/ProfileScreen.vue'),
      },
      // ✅ NEW — Station page (nested under mainScreen for footer)
      {
        path: 'station/:stationId',
        name: 'stationScreen',
        component: () => import('src/components/StationScreen.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
