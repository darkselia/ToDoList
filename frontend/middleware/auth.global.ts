import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((to) => {
  const { token, hydrateFromStorage } = useAuth();
  hydrateFromStorage();

  const isLoggedIn = Boolean(token.value);

  if (!isLoggedIn && to.path !== '/login') {
    return navigateTo('/login');
  }

  if (isLoggedIn && to.path === '/login') {
    return navigateTo('/tasks');
  }
});
