import { create } from "zustand";

const SETTINGS_KEY = "nyt-games-settings";

export interface GamesSettings {
  darkMode: boolean;
  hardMode: boolean;
  colorBlindMode: boolean;
}

const DEFAULT_SETTINGS: GamesSettings = {
  darkMode: false,
  hardMode: false,
  colorBlindMode: false,
};

function loadSettings(): GamesSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: GamesSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface SettingsStore extends GamesSettings {
  hydrated: boolean;
  hydrate: () => void;
  toggleDarkMode: () => void;
  toggleHardMode: () => void;
  setHardMode: (enabled: boolean) => void;
  toggleColorBlindMode: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,

  hydrate: () => {
    const loaded = loadSettings();
    set({ ...loaded, hydrated: true });
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    const settings = { ...get(), darkMode: next };
    saveSettings(settings);
    set({ darkMode: next });
  },

  toggleHardMode: () => {
    const next = !get().hardMode;
    const settings = { ...get(), hardMode: next };
    saveSettings(settings);
    set({ hardMode: next });
  },

  setHardMode: (enabled) => {
    const settings = { ...get(), hardMode: enabled };
    saveSettings(settings);
    set({ hardMode: enabled });
  },

  toggleColorBlindMode: () => {
    const next = !get().colorBlindMode;
    const settings = { ...get(), colorBlindMode: next };
    saveSettings(settings);
    set({ colorBlindMode: next });
  },
}));
