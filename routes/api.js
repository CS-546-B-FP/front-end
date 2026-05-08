import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as api from '../services/api.js';

const router = Router();

router.post('/api/watchlist/toggle', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.watchlist.toggle(req.body.buildingId, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    const ids = req.session.watchlistIds || [];
    if (result.data.watching) {
      if (!ids.includes(req.body.buildingId)) ids.push(req.body.buildingId);
    } else {
      req.session.watchlistIds = ids.filter(id => String(id) !== String(req.body.buildingId));
    }
    if (result.data.watching) req.session.watchlistIds = ids;

    return res.json({ success: true, data: result.data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/api/buildings/:id/review', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.reviews.create(req.params.id, {
      reviewText: req.body.reviewText || req.body.text || '',
      rating: Number(req.body.rating),
      issueTags: req.body.issueTags ? [].concat(req.body.issueTags) : []
    }, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.status(201).json({ success: true, data: result.data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/api/shortlists/:shortlistId/items/:buildingId/note', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.shortlists.updateNote(
      req.params.shortlistId,
      req.params.buildingId,
      req.body.note || req.body.privateNote || '',
      cookie
    );

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/api/shortlists/:shortlistId/items/:buildingId', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.shortlists.removeItem(req.params.shortlistId, req.params.buildingId, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/api/status', (req, res) => {
  return res.json({ status: 'ok', authenticated: !!req.session?.user });
});

export default router;
