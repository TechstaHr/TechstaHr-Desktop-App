import { _user } from "@/types";
import { create } from "zustand";

type UserStore = {
  user: _user | null;
  setUser: (user: _user) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
