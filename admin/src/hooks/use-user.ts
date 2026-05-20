'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { Role } from '@/utils/permissions';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  error: any;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

let fetchPromise: Promise<void> | null = null;

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  fetchUser: async () => {
    // If user is already resolved, do not trigger a reload
    if (get().user) {
      set({ loading: false });
      return;
    }

    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              set({
                user: {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.name,
                  role: data.user.role as Role,
                },
                loading: false,
              });
              return;
            }
          }
          set({ user: null, loading: false });
        } catch (e) {
          console.error('Error fetching user profile:', e);
          set({ error: e, loading: false });
        } finally {
          fetchPromise = null;
        }
      })();
    }

    await fetchPromise;
  },
  clearUser: () => set({ user: null, loading: false }),
}));

export function useUser() {
  const { user, loading, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading };
}
