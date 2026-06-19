import { create } from "zustand";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  commandPaletteOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem("gkm-theme") as Theme | null;
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return systemPrefersDark ? "dark" : "light";
};

// Apply theme to document element
const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem("gkm-theme", theme);
};

export const useUIStore = create<UIState>((set) => {
  // Set initial theme
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    commandPaletteOpen: false,
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        applyTheme(newTheme);
        return { theme: newTheme };
      }),
    setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    toggleCommandPalette: () =>
      set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  };
});
