// index.ts
import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

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

  Router.beforeEach((to) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    // ✅ Added '/signUpScreen'
    const publicPages = [
      '/',
      '/welcomeScreen',
      '/logInScreen',
      '/signUpScreen',
      '/signUpScreenSecond',
      '/signUpScreenThird',
    ];

    if (isAuthenticated && publicPages.includes(to.path)) {
      // Already logged in → redirect to main
      return { path: '/mainScreen', replace: true };
    }

    if (!isAuthenticated && !publicPages.includes(to.path)) {
      // Not logged in + trying to access protected page → redirect to welcome
      return { path: '/welcomeScreen', replace: true };
    }

    // ✅ Allow navigation (no need to call next())
    return true;
  });

  return Router;
});
