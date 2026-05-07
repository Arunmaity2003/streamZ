import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("streamZ-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("streamZ-theme", theme);
    set({ theme });
  },
}));