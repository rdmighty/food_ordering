import { getCurrentUser } from '@/lib/appwrite';
import { User } from '@/type';
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setIsLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: isAuthenticated => set({ isAuthenticated }),
    setUser: user => set({ user }),
    setIsLoading: isLoading => set({ isLoading }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();
            if (user) {
                set({ isAuthenticated: true, user: user as any });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (error) {
            console.error('fetchAuthenticatedUser error', error);
            set({ isAuthenticated: false, user: null });
        } finally {
            set({ isLoading: false })
        }
    }
}));
