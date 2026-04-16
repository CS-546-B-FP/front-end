import { Router } from 'express';

import { renderApiPlaceholder } from './route-utils.js';

const router = Router();

router.post('/api/buildings/:id/review', (req, res) => {
  return renderApiPlaceholder(res, {
    feature: 'reviews',
    route: req.path,
    method: req.method
  });
});

router.post('/api/watchlist/toggle', (req, res) => {
  return renderApiPlaceholder(res, {
    feature: 'watchlist',
    route: req.path,
    method: req.method
  });
});

router.post('/api/shortlists/:shortlistId/items/:buildingId/note', (req, res) => {
  return renderApiPlaceholder(res, {
    feature: 'shortlists',
    route: req.path,
    method: req.method
  });
});

router.get('/api/status', (req, res) => {
  return renderApiPlaceholder(res, {
    feature: 'api-shell',
    route: req.path,
    method: req.method
  });
});

export default router;
