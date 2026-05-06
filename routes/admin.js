import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as api from '../services/api.js';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/app.js'];
const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

function mapFormToApi(body) {
  const mapped = { ...body };
  if (body.address) {
    mapped.streetAddress = body.address;
    delete mapped.address;
  }
  if (body.owner !== undefined) {
    mapped.ownerName = body.owner;
    delete mapped.owner;
  }
  return mapped;
}

router.use('/admin', requireAdmin);

router.get('/admin/buildings', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.buildings.list({ limit: 100 });
    const buildings = result.ok
      ? (result.data.items || []).map(b => ({ ...b, address: b.streetAddress || b.address || '' }))
      : [];

    return res.render('admin/buildings/index', {
      pageTitle: 'Manage Buildings — LeaseWise NYC',
      buildings,
      scripts: SCRIPTS
    });
  } catch {
    return res.render('admin/buildings/index', {
      pageTitle: 'Manage Buildings — LeaseWise NYC',
      buildings: [],
      scripts: SCRIPTS
    });
  }
});

router.get('/admin/buildings/new', (req, res) => {
  res.render('admin/buildings/form', {
    pageTitle: 'Add Building — LeaseWise NYC',
    building: {},
    boroughs: BOROUGHS,
    errors: [],
    scripts: SCRIPTS
  });
});

router.get('/admin/buildings/:id/edit', async (req, res) => {
  try {
    const result = await api.buildings.getById(req.params.id);
    if (!result.ok) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found — LeaseWise NYC' });
    }

    const building = result.data;
    building.address = building.streetAddress || building.address || '';
    building.owner = building.ownerName || '';

    return res.render('admin/buildings/form', {
      pageTitle: 'Edit Building — LeaseWise NYC',
      building,
      boroughs: BOROUGHS,
      errors: [],
      scripts: SCRIPTS
    });
  } catch {
    return res.status(500).render('errors/500', { pageTitle: 'Error — LeaseWise NYC' });
  }
});

router.post('/admin/buildings', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.admin.createBuilding(mapFormToApi(req.body), cookie);

    if (!result.ok) {
      return res.render('admin/buildings/form', {
        pageTitle: 'Add Building — LeaseWise NYC',
        building: req.body,
        boroughs: BOROUGHS,
        errors: [{ message: result.error || 'Failed to create building.' }],
        scripts: SCRIPTS
      });
    }

    return res.redirect('/admin/buildings');
  } catch {
    return res.render('admin/buildings/form', {
      pageTitle: 'Add Building — LeaseWise NYC',
      building: req.body,
      boroughs: BOROUGHS,
      errors: [{ message: 'An unexpected error occurred.' }],
      scripts: SCRIPTS
    });
  }
});

router.put('/admin/buildings/:id', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    const result = await api.admin.updateBuilding(req.params.id, mapFormToApi(req.body), cookie);

    if (!result.ok) {
      return res.render('admin/buildings/form', {
        pageTitle: 'Edit Building — LeaseWise NYC',
        building: { ...req.body, _id: req.params.id },
        boroughs: BOROUGHS,
        errors: [{ message: result.error || 'Failed to update building.' }],
        scripts: SCRIPTS
      });
    }

    return res.redirect('/admin/buildings');
  } catch {
    return res.render('admin/buildings/form', {
      pageTitle: 'Edit Building — LeaseWise NYC',
      building: { ...req.body, _id: req.params.id },
      boroughs: BOROUGHS,
      errors: [{ message: 'An unexpected error occurred.' }],
      scripts: SCRIPTS
    });
  }
});

router.delete('/admin/buildings/:id', async (req, res) => {
  try {
    const cookie = req.session.backendCookie;
    await api.admin.deleteBuilding(req.params.id, cookie);
  } catch { /* ignore */ }
  return res.redirect('/admin/buildings');
});

export default router;
