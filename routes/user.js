import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as api from '../services/api.js';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/watchlist.js', '/public/js/ajax-form.js', '/public/js/shortlist-note.js', '/public/js/app.js'];

router.use('/account', requireAuth);
router.use('/watchlist', requireAuth);
router.use('/shortlists', requireAuth);
router.use('/compare', requireAuth);

router.get('/account', (req, res) => {
  res.render('account', {
    pageTitle: 'My Account — LeaseWise NYC',
    user: req.session.user,
    errors: [],
    passwordErrors: [],
    scripts: SCRIPTS
  });
});

router.post('/account', async (req, res) => {
  const cookie = req.session.backendCookie;
  const { firstName, lastName, email, username } = req.body;
  try {
    const result = await api.users.updateProfile({ firstName, lastName, email, username }, cookie);
    if (!result.ok) {
      return res.render('account', {
        pageTitle: 'My Account — LeaseWise NYC',
        user: { ...req.session.user, firstName, lastName, email, username },
        errors: [{ message: result.error || 'Failed to update profile.' }],
        passwordErrors: [],
        scripts: SCRIPTS
      });
    }
    req.session.user = result.data;
    return res.redirect('/account');
  } catch {
    return res.render('account', {
      pageTitle: 'My Account — LeaseWise NYC',
      user: req.session.user,
      errors: [{ message: 'An unexpected error occurred.' }],
      passwordErrors: [],
      scripts: SCRIPTS
    });
  }
});

router.post('/account/password', async (req, res) => {
  const cookie = req.session.backendCookie;
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await api.users.changePassword({ currentPassword, newPassword }, cookie);
    if (!result.ok) {
      return res.render('account', {
        pageTitle: 'My Account — LeaseWise NYC',
        user: req.session.user,
        errors: [],
        passwordErrors: [{ message: result.error || 'Failed to change password.' }],
        scripts: SCRIPTS
      });
    }
    return res.redirect('/account');
  } catch {
    return res.render('account', {
      pageTitle: 'My Account — LeaseWise NYC',
      user: req.session.user,
      errors: [],
      passwordErrors: [{ message: 'An unexpected error occurred.' }],
      scripts: SCRIPTS
    });
  }
});

router.delete('/account', async (req, res) => {
  const cookie = req.session.backendCookie;
  try {
    await api.users.deleteAccount(cookie);
  } catch { /* ignore */ }
  req.session.destroy(() => res.redirect('/'));
});

router.get('/watchlist', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const watchlistIds = req.session.watchlistIds || [];

    const buildingPromises = watchlistIds.map(id => api.buildings.getById(id));
    const results = await Promise.all(buildingPromises);
    const buildings = results
      .filter(r => r.ok)
      .map(r => ({ ...r.data, address: r.data.streetAddress || r.data.address || '' }));

    return res.render('watchlist', {
      pageTitle: 'My Watchlist — LeaseWise NYC',
      buildings,
      scripts: SCRIPTS
    });
  } catch {
    return res.render('watchlist', {
      pageTitle: 'My Watchlist — LeaseWise NYC',
      buildings: [],
      scripts: SCRIPTS
    });
  }
});

router.get('/shortlists', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.shortlists.list(cookie);
    const shortlists = result.ok
      ? (result.data || []).map(sl => ({
          _id: sl._id,
          name: sl.shortlistName || sl.name || '',
          items: sl.items || []
        }))
      : [];

    return res.render('shortlists/index', {
      pageTitle: 'My Shortlists — LeaseWise NYC',
      shortlists,
      scripts: SCRIPTS
    });
  } catch {
    return res.render('shortlists/index', {
      pageTitle: 'My Shortlists — LeaseWise NYC',
      shortlists: [],
      scripts: SCRIPTS
    });
  }
});

router.get('/shortlists/:id', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.shortlists.list(cookie);
    if (!result.ok) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found — LeaseWise NYC' });
    }

    const shortlist = (result.data || []).find(sl => String(sl._id) === req.params.id);
    if (!shortlist) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found — LeaseWise NYC' });
    }

    const items = await Promise.all(
      (shortlist.items || []).map(async (item) => {
        const bid = item.buildingId || item._id;
        const bResult = await api.buildings.getById(bid);
        return {
          _id: bid,
          building: bResult.ok
            ? { ...bResult.data, address: bResult.data.streetAddress || bResult.data.address || '' }
            : { _id: bid, address: 'Unknown building', borough: '' },
          privateNote: item.privateNote || ''
        };
      })
    );

    return res.render('shortlists/detail', {
      pageTitle: `${shortlist.shortlistName || shortlist.name || 'Shortlist'} — LeaseWise NYC`,
      shortlist: {
        _id: shortlist._id,
        name: shortlist.shortlistName || shortlist.name || '',
        items
      },
      scripts: SCRIPTS
    });
  } catch {
    return res.status(500).render('errors/500', { pageTitle: 'Error — LeaseWise NYC' });
  }
});

router.get('/compare', async (req, res) => {
  try {
    const { shortlistId } = req.query;
    const cookie = req.session.backendCookie;

    if (!shortlistId) {
      return res.render('compare', {
        pageTitle: 'Compare Buildings — LeaseWise NYC',
        buildings: [],
        scripts: SCRIPTS
      });
    }

    const result = await api.shortlists.list(cookie);
    const shortlist = result.ok
      ? (result.data || []).find(sl => String(sl._id) === shortlistId)
      : null;

    if (!shortlist) {
      return res.render('compare', {
        pageTitle: 'Compare Buildings — LeaseWise NYC',
        buildings: [],
        scripts: SCRIPTS
      });
    }

    const buildingResults = await Promise.all(
      (shortlist.items || []).map(item => api.buildings.getById(item.buildingId || item._id))
    );
    const buildings = buildingResults
      .filter(r => r.ok)
      .map(r => ({ ...r.data, address: r.data.streetAddress || r.data.address || '' }));

    return res.render('compare', {
      pageTitle: 'Compare Buildings — LeaseWise NYC',
      buildings,
      scripts: SCRIPTS
    });
  } catch {
    return res.render('compare', {
      pageTitle: 'Compare Buildings — LeaseWise NYC',
      buildings: [],
      scripts: SCRIPTS
    });
  }
});

router.post('/shortlists', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.shortlists.create(req.body.name, cookie);
  } catch { /* ignore */ }
  return res.redirect('/shortlists');
});

router.post('/shortlists/add', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const { shortlistId, buildingId } = req.body;
    await api.shortlists.addItem(shortlistId, buildingId, cookie);
  } catch { /* ignore */ }
  return res.redirect('back');
});

router.delete('/shortlists/:id', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.shortlists.remove(req.params.id, cookie);
  } catch { /* ignore */ }
  return res.redirect('/shortlists');
});

router.delete('/shortlists/:id/items/:buildingId', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.shortlists.removeItem(req.params.id, req.params.buildingId, cookie);
  } catch { /* ignore */ }
  return res.redirect(`/shortlists/${req.params.id}`);
});

router.post('/shortlists/:id/items/:buildingId/note', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.shortlists.updateNote(
      req.params.id,
      req.params.buildingId,
      req.body.privateNote || req.body.note || '',
      cookie
    );
  } catch { /* ignore */ }
  return res.redirect(`/shortlists/${req.params.id}`);
});

router.post('/watchlist/:buildingId', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.watchlist.toggle(req.params.buildingId, cookie);
    if (result.ok) {
      const ids = req.session.watchlistIds || [];
      if (result.data.watching) {
        if (!ids.includes(req.params.buildingId)) ids.push(req.params.buildingId);
      } else {
        req.session.watchlistIds = ids.filter(id => String(id) !== String(req.params.buildingId));
      }
      if (result.data.watching) req.session.watchlistIds = ids;
    }
  } catch { /* ignore */ }
  return res.redirect('back');
});

router.post('/buildings/:id/reviews', requireAuth, async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.reviews.create(req.params.id, {
      reviewText: req.body.text || req.body.reviewText || '',
      rating: req.body.rating,
      issueTags: req.body.issueTags ? [].concat(req.body.issueTags) : []
    }, cookie);
  } catch { /* ignore */ }
  return res.redirect(`/buildings/${req.params.id}`);
});

export default router;
