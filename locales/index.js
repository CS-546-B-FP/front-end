import en from './en.js';
import zhCn from './zh-CN.js';

const dictionaries = {
  en,
  'zh-CN': zhCn
};

export const supportedLocales = Object.keys(dictionaries);
export const defaultLocale = 'en';

export function getMessages(locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}
