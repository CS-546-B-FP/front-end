import { Router } from 'express';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/app.js'];

router.get('/', (req, res) => {
  res.render('home', { pageTitle: 'LeaseWise NYC — Know before you lease', scripts: SCRIPTS });
});

router.get('/buildings', (req, res) => {
  res.render('buildings/index', { pageTitle: 'Browse Buildings — LeaseWise NYC', buildings: [], scripts: SCRIPTS });
});

router.get('/buildings/:id', (req, res) => {
  res.render('buildings/detail', { pageTitle: 'Building — LeaseWise NYC', building: { _id: req.params.id, address: '', housingRecords: [], riskSummary: null }, reviews: [], scripts: SCRIPTS });
});

router.get('/portfolios/:type/:id', (req, res) => {
  res.render('portfolios/detail', { pageTitle: 'Portfolio — LeaseWise NYC', portfolio: { name: '', buildingCount: 0 }, buildings: [], scripts: SCRIPTS });
});

export default router;
