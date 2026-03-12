// src/router/index.ts
import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { auth } from 'src/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ✅ Wait for Firebase to check if user is logged in
const getCurrentUser = (): Promise<unknown> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    // ✅ Check Firebase auth state (not localStorage anymore)
    const currentUser = await getCurrentUser();
    const isAuthenticated = !!currentUser;

    const publicPages = [
      '/',
      '/welcomeScreen',
      '/logInScreen',
      '/signUpScreen',
      '/signUpScreenSecond',
      '/signUpScreenThird',
    ];

    if (isAuthenticated && publicPages.includes(to.path)) {
      return { path: '/mainScreen', replace: true };
    }

    if (!isAuthenticated && !publicPages.includes(to.path)) {
      return { path: '/welcomeScreen', replace: true };
    }

    return true;
  });

  return Router;
});
