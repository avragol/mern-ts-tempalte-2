import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import he from "./locales/he.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "golda_lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  const dir = lng === "he" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction on load
document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
document.documentElement.lang = i18n.language;

export default i18n;
