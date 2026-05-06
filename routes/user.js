import { Router } from 'express';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/app.js'];

router.get('/account', (req, res) => {
  res.render('account', { pageTitle: 'My Account — LeaseWise NYC', user: {}, scripts: SCRIPTS });
});

router.get('/watchlist', (req, res) => {
  res.render('watchlist', { pageTitle: 'My Watchlist — LeaseWise NYC', buildings: [], scripts: SCRIPTS });
});

router.get('/shortlists', (req, res) => {
  res.render('shortlists/index', { pageTitle: 'My Shortlists — LeaseWise NYC', shortlists: [], scripts: SCRIPTS });
});

router.get('/shortlists/:id', (req, res) => {
  res.render('shortlists/detail', { pageTitle: 'Shortlist — LeaseWise NYC', shortlist: { _id: req.params.id, name: '', items: [] }, scripts: SCRIPTS });
});

router.get('/compare', (req, res) => {
  res.render('compare', { pageTitle: 'Compare Buildings — LeaseWise NYC', buildings: [], scripts: SCRIPTS });
});

export default router;
