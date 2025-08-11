import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./Resource/en/common.json";
import translationHI from "./Resource/hn/common.json";


//Creating object with the variables of imported translation files
const resources = {
  EN: {
    translation: translationEN,
  },
  HN: {
    translation: translationHI,
  },
};

//i18N Initialization

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng:"en", //default language
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
