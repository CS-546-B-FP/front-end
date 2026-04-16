import { getApiPlaceholder, getPagePlaceholder } from '../services/leasewise-service.js';

export function renderFeaturePage(res, options) {
  return res.render('placeholder', getPagePlaceholder(options));
}

export function renderApiPlaceholder(res, options) {
  return res.status(501).json(getApiPlaceholder(options));
}

export function renderNotFound(res) {
  return res.status(404).render('errors/404', {
    pageTitle: 'Page not found - LeaseWise NYC',
    heading: res.locals.messages?.errors?.notFoundTitle || 'Page not found',
    message: res.locals.messages?.errors?.notFoundMessage || 'The page you requested is not available.'
  });
}

export function renderUnexpectedError(res, error) {
  return res.status(500).render('errors/500', {
    pageTitle: 'Unexpected error - LeaseWise NYC',
    heading: res.locals.messages?.errors?.unexpectedTitle || 'Something went wrong',
    message:
      error.message ||
      res.locals.messages?.errors?.unexpectedMessage ||
      'An unexpected error occurred. Please try again later.'
  });
}
