import { createContext, useContext } from "react";

export type Language = "bn" | "en";

export const LANGUAGE_STORAGE_KEY = "likhon-tools-language";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "bn";
  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return value === "en" ? "en" : "bn";
}

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: "bn" as const, setLanguage: () => undefined };
  }
  return context;
}
