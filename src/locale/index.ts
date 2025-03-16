import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationZh from './zh/translation.json';
import translationEn from './en/translation.json';

export enum LangEnum {
  EN = 'en',
  ZH = 'zh',
}

export const resources = {
  translation: translationEn,
};

i18n.use(initReactI18next).init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: translationEn,
    },
    zh: {
      translation: translationZh,
    },
  },
});

export default i18n;
