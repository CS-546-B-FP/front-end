import { Router } from 'express';

import { renderFeaturePage } from './route-utils.js';

const router = Router();

router.get('/', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Home',
    routeGroup: 'Public',
    pagePath: req.path,
    description: 'This page is a placeholder for the LeaseWise NYC home experience.',
    todoItems: [
      'Featured buildings, neighborhoods, and market highlights will appear here.',
      'Visitors will be able to start a search by address, owner, or management company.',
      'Key actions for browsing, saving, and comparing listings will appear here.'
    ]
  });
});

router.get('/buildings', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Buildings',
    routeGroup: 'Public',
    pagePath: req.path,
    description: 'This page is a placeholder for building search and results.',
    todoItems: [
      'Search results will list core building details, ratings, and quick actions.',
      'Filters and sorting will help narrow results by location, ownership, and signals.',
      'Each result will link to a full building profile.'
    ]
  });
});

router.get('/buildings/:id', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Building Detail',
    routeGroup: 'Public',
    pagePath: req.path,
    description: 'This page is a placeholder for an individual building profile.',
    todoItems: [
      'Property basics, records, and summaries will appear here.',
      'Ownership, management, and related building links will be shown here.',
      'Residents will be able to review history, notes, and comparison actions here.'
    ]
  });
});

router.get('/portfolios/:type/:id', (req, res) => {
  return renderFeaturePage(res, {
    title: 'Portfolio',
    routeGroup: 'Public',
    pagePath: req.path,
    description: 'This page is a placeholder for owner and manager portfolio views.',
    todoItems: [
      'Portfolio summaries and linked buildings will appear here.',
      'Users will be able to switch between owner and manager contexts.',
      'Aggregate signals and recent activity will be shown here.'
    ]
  });
});

export default router;
