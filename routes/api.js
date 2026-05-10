import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as api from '../services/api.js';
import { shortlistNoteValidationSchema, validateForm } from '../utils/validation.js';

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
    const validation = validateForm(
      { privateNote: req.body.privateNote ?? req.body.note ?? '' },
      shortlistNoteValidationSchema
    );

    if (!validation.isValid) {
      const message = validation.errors.privateNote?.message || 'Private note is invalid.';
      return res.status(400).json({
        success: false,
        error: message,
        fieldErrors: { privateNote: message }
      });
    }

    const result = await api.shortlists.updateNote(
      req.params.shortlistId,
      req.params.buildingId,
      validation.values.privateNote,
      cookie
    );

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.json({
      success: true,
      message: 'Note saved.',
      data: { privateNote: validation.values.privateNote }
    });
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

router.put('/api/reviews/:id', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.reviews.update(req.params.id, {
      reviewText: req.body.reviewText || req.body.text || '',
      rating: Number(req.body.rating),
      issueTags: req.body.issueTags ? [].concat(req.body.issueTags) : []
    }, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({ success: false, error: result.error });
    }

    return res.json({ success: true, data: result.data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.reviews.remove(req.params.id, cookie);

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

router.post('/api/admin/users/:id/promote', requireAdmin, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;

    const result = await api.admin.promoteUser(req.params.id, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      data: result.data
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/api/admin/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;

    const result = await api.admin.banUser(req.params.id, cookie);

    if (!result.ok) {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      data: result.data
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
