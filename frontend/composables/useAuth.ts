import type { ApiResponse } from '~/types/api';
import { extractApiErrorMessage } from '~/utils/apiError';

type LoginData = {
    token: string;
    user: {
        id: number;
        email: string;
        createdAt: string;
    };
};

const TOKEN_STORAGE_KEY = 'todo_access_token';

export function useAuth() {
    const token = useState<string | null>('auth_token', () => null);

    function hydrateFromStorage() {
        if (!import.meta.client) {
            return;
        }

        if (token.value) {
            return;
        }

        const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        token.value = savedToken && savedToken.trim().length > 0 ? savedToken : null;
    }

    function setToken(value: string) {
        token.value = value;

        if (import.meta.client) {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
        }
    }

    function clearToken() {
        token.value = null;

        if (import.meta.client) {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }

    async function login(email: string, password: string) {
        const nuxtApp = useNuxtApp();
        let response: ApiResponse<LoginData>;

        try {
            response = await nuxtApp.$api<ApiResponse<LoginData>>('/api/auth/login', {
                method: 'POST',
                body: {
                    email,
                    password
                }
            });
        } catch (error) {
            const rawMessage = extractApiErrorMessage(error, '');
            throw new Error(rawMessage || 'Не удалось выполнить вход.');
        }

        if (!response.success || !response.data?.token) {
            throw new Error(response.error?.message || 'Не удалось выполнить вход.');
        }

        setToken(response.data.token);
        return response.data;


    }

    function logout() {
        clearToken();
    }

    return {
        token,
        hydrateFromStorage,
        setToken,
        clearToken,
        login,
        logout
    };
}

