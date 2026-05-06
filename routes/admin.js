import { Router } from 'express';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/app.js'];
const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

router.get('/admin/buildings', (req, res) => {
  res.render('admin/buildings/index', { pageTitle: 'Manage Buildings — LeaseWise NYC', buildings: [], scripts: SCRIPTS });
});

router.get('/admin/buildings/new', (req, res) => {
  res.render('admin/buildings/form', { pageTitle: 'Add Building — LeaseWise NYC', building: {}, boroughs: BOROUGHS, scripts: SCRIPTS });
});

router.get('/admin/buildings/:id/edit', (req, res) => {
  res.render('admin/buildings/form', { pageTitle: 'Edit Building — LeaseWise NYC', building: { _id: req.params.id }, boroughs: BOROUGHS, scripts: SCRIPTS });
});

export default router;
