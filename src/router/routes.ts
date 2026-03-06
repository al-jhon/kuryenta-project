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
    component: () => import('src/features/logInPage/LogInScreen.vue'),
  },

  {
    path: '/mainScreen',
    component: () => import('src/features/homePage/MainScreen.vue'),
    children: [
      {
        path: '',
        component: () => import('src/components/HomeScreen.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
