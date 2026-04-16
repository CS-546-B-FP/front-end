import { toPlaceholderPageModel } from '../adapters/view-models.js';

export function getPagePlaceholder({ title, routeGroup, description, pagePath, todoItems = [] }) {
  return {
    pageTitle: `${title} - LeaseWise NYC`,
    page: toPlaceholderPageModel({
      title,
      routeGroup,
      description,
      pagePath,
      todoItems
    }),
    scripts: ['/public/js/app.js']
  };
}

export function getApiPlaceholder({ feature, route, method }) {
  return {
    status: 'not_implemented',
    feature,
    route,
    method,
    message: 'This endpoint is not available yet.'
  };
}
