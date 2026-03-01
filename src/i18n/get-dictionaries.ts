import type { Locale } from "./config";

const dictionaries = {
    fr: () => import("./locales/fr/common.json").then((module) => module.default),
    ar: () => import("./locales/ar/common.json").then((module) => module.default),
};

const authDictionaries = {
    fr: () => import("./locales/fr/auth.json").then((module) => module.default),
    ar: () => import("./locales/ar/auth.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
export const getAuthDictionary = async (locale: Locale) => authDictionaries[locale]();
