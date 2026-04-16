import { defaultLocale, getMessages, supportedLocales } from '../locales/index.js';

function buildLanguageLink(pathname, query, locale) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query || {})) {
    if (key === 'lang') {
      continue;
    }

    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }

    searchParams.set(key, value);
  }

  searchParams.set('lang', locale);
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function attachViewContext(req, res, next) {
  const requestedLocale = typeof req.query.lang === 'string' ? req.query.lang : '';
  const locale = supportedLocales.includes(requestedLocale) ? requestedLocale : defaultLocale;

  res.locals.locale = locale;
  res.locals.messages = getMessages(locale);
  res.locals.currentPath = req.path;
  res.locals.currentQuery = req.query;
  res.locals.languageLinks = {
    en: buildLanguageLink(req.path, req.query, 'en'),
    zhCn: buildLanguageLink(req.path, req.query, 'zh-CN')
  };
  res.locals.appMode = 'placeholder-shell';

  next();
}
