type LoginResponse = {
    success: boolean;
    data?: {
        token: string;
        user: {
            id: number;
            email: string;
            createdAt: string;
        };
    };
    error?: {
        code: number;
        message: string;
    } | null;
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

        try {
            const response = await nuxtApp.$api<LoginResponse>('/api/auth/login', {
                method: 'POST',
                body: {
                    email,
                    password
                }
            });

            if (!response.success || !response.data?.token) {
                throw new Error(response.error?.message || 'Login failed.');
            }

            setToken(response.data.token);
            return response.data;
        } catch (error) {
            throw new Error('Произошла ошибка при входе. Пожалуйста, попробуйте снова.');
        }


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

