import { Router } from 'express';

import { renderFeaturePage } from './route-utils.js';

const router = Router();

router.get('/account', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Account',
    routeGroup: 'Account',
    pagePath: req.path,
    description: 'This page is a placeholder for the signed-in account overview.',
    todoItems: [
      'Profile details and account settings will appear here.',
      'Recent activity, saved items, and shortcuts will be listed here.',
      'Users will be able to manage their account preferences here.'
    ]
  });
});

router.get('/watchlist', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Watchlist',
    routeGroup: 'Account',
    pagePath: req.path,
    description: 'This page is a placeholder for saved building tracking.',
    todoItems: [
      'Saved buildings and status changes will be listed here.',
      'Users will be able to review notes and revisit tracked properties.',
      'Empty and loading states will be handled here.'
    ]
  });
});

router.get('/shortlists', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Shortlists',
    routeGroup: 'Account',
    pagePath: req.path,
    description: 'This page is a placeholder for shortlist management.',
    todoItems: [
      'Users will review all saved shortlists here.',
      'Each shortlist will show a summary and quick actions.',
      'Creation, editing, and comparison entry points will appear here.'
    ]
  });
});

router.get('/shortlists/:id', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Shortlist Detail',
    routeGroup: 'Account',
    pagePath: req.path,
    description: 'This page is a placeholder for an individual shortlist.',
    todoItems: [
      'Selected buildings and private notes will be managed here.',
      'Reordering, note editing, and compare actions will appear here.',
      'Sharing or export actions can be added here if needed.'
    ]
  });
});

router.get('/compare', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Compare',
    routeGroup: 'Account',
    pagePath: req.path,
    description: 'This page is a placeholder for side-by-side building comparison.',
    todoItems: [
      'Selected buildings will be compared across shared data points.',
      'Users will be able to review differences in a structured layout.',
      'Print, export, or save actions can be added here if needed.'
    ]
  });
});

export default router;
