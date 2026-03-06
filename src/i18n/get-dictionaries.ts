import type { Locale } from "./config";

const dictionaries = {
    fr: () => import("./locales/fr/common.json").then((module) => module.default),
    ar: () => import("./locales/ar/common.json").then((module) => module.default),
};

const authDictionaries = {
    fr: () => import("./locales/fr/auth.json").then((module) => module.default),
    ar: () => import("./locales/ar/auth.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const safeLocale = locale === "ar" ? "ar" : "fr";
  return dictionaries[safeLocale]();
};

export const getAuthDictionary = async (locale: Locale) => {
  const safeLocale = locale === "ar" ? "ar" : "fr";
  return authDictionaries[safeLocale]();
};