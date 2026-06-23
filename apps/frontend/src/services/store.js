import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null, // { id, name, role }
  session: null, // { id, workshopId }
  
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
