import { useAuth } from '~/composables/useAuth';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { token, hydrateFromStorage, clearToken } = useAuth();

  const api = $fetch.create({
    baseURL: String(config.public.apiBase || 'http://localhost:4000'),
    onRequest({ options }) {
      hydrateFromStorage();

      if (!token.value) {
        return;
      }

      const headers = new Headers(options.headers as HeadersInit | undefined);
      headers.set('x-access-token', token.value);
      options.headers = headers;
    },
    async onResponseError({ response }) {
      if (response?.status !== 401) {
        return;
      }

      clearToken();

      if (!import.meta.client) {
        return;
      }

      if (window.location.pathname !== '/login') {
        await navigateTo('/login', { replace: true });
      }
    }
  });

  return {
    provide: {
      api
    }
  };
});
