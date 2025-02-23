import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import global_en from ".//en/en.json";
import global_bg from ".//bg/bg.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      global: global_en,
    },
    bg: {
      global: global_bg,
    },
  },
  lng: localStorage.getItem("language") || "bg",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
