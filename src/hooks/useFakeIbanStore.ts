import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import type { GeneratedIBAN, IBANConfig } from "../utils/ibanUtils";

export interface FakeIbanState {
  // Generator settings
  selectedCountry: string;
  generationMode: "valid" | "invalid";
  quantity: number;
  showMasked: boolean;
  isDarkMode: boolean;

  // Generated data (not persisted)
  generatedIbans: GeneratedIBAN[];

  // History (persisted)
  recentConfigs: IBANConfig[];

  // Actions
  setSelectedCountry: (country: string) => void;
  setGenerationMode: (mode: "valid" | "invalid") => void;
  setQuantity: (quantity: number) => void;
  setShowMasked: (masked: boolean) => void;
  setIsDarkMode: (darkMode: boolean) => void;
  setGeneratedIbans: (ibans: GeneratedIBAN[]) => void;
  saveConfig: (config: IBANConfig) => void;
  loadConfig: (config: IBANConfig) => void;
  clearHistory: () => void;
}

// Custom storage implementation using cookies
const cookieStorage = {
  getItem: (name: string) => {
    try {
      const value = Cookies.get(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn("Failed to get cookie:", error);
      return null;
    }
  },
  setItem: (name: string, value: any): void => {
    try {
      // Set cookie with 1 year expiration for settings persistence
      Cookies.set(name, JSON.stringify(value), { 
        expires: 365,
        secure: window.location.protocol === "https:",
        sameSite: "Lax"
      });
    } catch (error) {
      console.warn("Failed to set cookie:", error);
    }
  },
  removeItem: (name: string): void => {
    try {
      Cookies.remove(name);
    } catch (error) {
      console.warn("Failed to remove cookie:", error);
    }
  },
};

export const useFakeIbanStore = create<FakeIbanState>()(
  persist(
    (set, get) => ({
      // Default state
      selectedCountry: "DE",
      generationMode: "valid",
      quantity: 5,
      showMasked: false,
      isDarkMode: typeof window !== "undefined" 
        ? window.matchMedia("(prefers-color-scheme: dark)").matches 
        : false,
      generatedIbans: [],
      recentConfigs: [],

      // Actions
      setSelectedCountry: (country: string) => {
        set({ selectedCountry: country });
      },

      setGenerationMode: (mode: "valid" | "invalid") => {
        set({ generationMode: mode });
      },

      setQuantity: (quantity: number) => {
        const clampedQuantity = Math.max(1, Math.min(1000, quantity));
        set({ quantity: clampedQuantity });
      },

      setShowMasked: (masked: boolean) => {
        set({ showMasked: masked });
      },

      setIsDarkMode: (darkMode: boolean) => {
        set({ isDarkMode: darkMode });
      },

      setGeneratedIbans: (ibans: GeneratedIBAN[]) => {
        set({ generatedIbans: ibans });
      },

      saveConfig: (config: IBANConfig) => {
        const { recentConfigs } = get();
        
        // Check if this exact config already exists
        const isDuplicate = recentConfigs.some(existing => 
          existing.country === config.country &&
          existing.mode === config.mode &&
          existing.quantity === config.quantity &&
          existing.useCustomBank === config.useCustomBank &&
          existing.customBankCode === config.customBankCode
        );

        if (!isDuplicate) {
          const updatedConfigs = [
            config,
            ...recentConfigs.slice(0, 9) // Keep last 10 configs
          ];
          
          set({ recentConfigs: updatedConfigs });
        }
      },

      loadConfig: (config: IBANConfig) => {
        set({
          selectedCountry: config.country,
          generationMode: config.mode,
          quantity: config.quantity,
        });
      },

      clearHistory: () => {
        set({ recentConfigs: [] });
      },
    }),
    {
      name: "fake-iban-settings",
      storage: cookieStorage,
      // Only persist user preferences, not generated data
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
        generationMode: state.generationMode,
        quantity: state.quantity,
        showMasked: state.showMasked,
        isDarkMode: state.isDarkMode,
        recentConfigs: state.recentConfigs,
      }),
      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clear any generated data on hydration
          state.generatedIbans = [];
        }
      },
    }
  )
);

export default useFakeIbanStore;
