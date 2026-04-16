import { Router } from 'express';

import { renderFeaturePage } from './route-utils.js';

const router = Router();

router.get('/admin/buildings', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Admin Buildings',
    routeGroup: 'Administration',
    pagePath: req.path,
    description: 'This page is a placeholder for building management.',
    todoItems: [
      'Admins will review the building catalog here.',
      'Search, filtering, and bulk actions will appear here.',
      'Create, edit, and archive actions will be available here.'
    ]
  });
});

router.get('/admin/buildings/new', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Admin Create Building',
    routeGroup: 'Administration',
    pagePath: req.path,
    description: 'This page is a placeholder for creating a building record.',
    todoItems: [
      'Core building details and ownership fields will be entered here.',
      'Validation feedback will help prevent incomplete submissions.',
      'Supporting sections for related data will be added here.'
    ]
  });
});

router.get('/admin/buildings/:id/edit', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Admin Edit Building',
    routeGroup: 'Administration',
    pagePath: req.path,
    description: 'This page is a placeholder for editing a building record.',
    todoItems: [
      'Existing building details will be updated here.',
      'Administrative fields and change controls will appear here.',
      'Archive or removal actions will be handled here.'
    ]
  });
});

export default router;
