export const locales = ["fr", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const getLocaleDirection = (locale: Locale): "ltr" | "rtl" => {
    return locale === "ar" ? "rtl" : "ltr";
};
