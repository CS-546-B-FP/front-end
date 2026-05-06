import { Router } from 'express';
import * as api from '../services/api.js';

const router = Router();

const SCRIPTS = ['/public/js/dialog.js', '/public/js/watchlist.js', '/public/js/app.js'];

router.get('/', (req, res) => {
  res.render('home', { pageTitle: 'LeaseWise NYC — Know before you lease', scripts: SCRIPTS });
});

router.get('/buildings', async (req, res) => {
  try {
    const { search, borough, page } = req.query;
    const result = await api.buildings.list({ search, borough, page });

    if (!result.ok) {
      return res.render('buildings/index', {
        pageTitle: 'Browse Buildings — LeaseWise NYC',
        buildings: [],
        scripts: SCRIPTS
      });
    }

    const { items, total, page: currentPage, limit } = result.data;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page: currentPage,
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1
    };

    let watchlistIds = [];
    if (req.session.user && req.session.backendCookie) {
      watchlistIds = req.session.watchlistIds || [];
    }

    return res.render('buildings/index', {
      pageTitle: 'Browse Buildings — LeaseWise NYC',
      buildings: items,
      pagination,
      watchlistIds,
      scripts: SCRIPTS
    });
  } catch {
    return res.render('buildings/index', {
      pageTitle: 'Browse Buildings — LeaseWise NYC',
      buildings: [],
      scripts: SCRIPTS
    });
  }
});

router.get('/buildings/:id', async (req, res) => {
  try {
    const cookie = req.session?.backendCookie;
    const [buildingResult, reviewsResult] = await Promise.all([
      api.buildings.getById(req.params.id),
      api.reviews.getForBuilding(req.params.id)
    ]);

    if (!buildingResult.ok) {
      return res.status(404).render('errors/404', {
        pageTitle: 'Building Not Found — LeaseWise NYC'
      });
    }

    const building = buildingResult.data;
    building.address = building.streetAddress || building.address || '';

    if (building.ownerName) {
      building.owner = { name: building.ownerName, _id: encodeURIComponent(building.ownerName) };
    }

    const reviews = (reviewsResult.ok ? reviewsResult.data : []).map(r => ({
      ...r,
      _id: r._id,
      author: r.firstName ? `${r.firstName} ${r.lastName || ''}`.trim() : 'Anonymous',
      text: r.reviewText || r.text || '',
      rating: r.rating || 0,
      issueTags: r.issueTags || [],
      createdAt: r.createdAt
    }));

    let isWatched = false;
    let userShortlists = [];

    if (req.session.user && cookie) {
      const watchlistIds = req.session.watchlistIds || [];
      isWatched = watchlistIds.some(id => String(id) === String(building._id));

      const slResult = await api.shortlists.list(cookie);
      if (slResult.ok) {
        userShortlists = (slResult.data || []).map(sl => ({
          _id: sl._id,
          name: sl.shortlistName || sl.name || ''
        }));
      }
    }

    return res.render('buildings/detail', {
      pageTitle: `${building.address} — LeaseWise NYC`,
      building,
      reviews,
      isWatched,
      userShortlists,
      scripts: ['/public/js/dialog.js', '/public/js/watchlist.js', '/public/js/review-form.js', '/public/js/app.js']
    });
  } catch {
    return res.status(500).render('errors/500', {
      pageTitle: 'Error — LeaseWise NYC'
    });
  }
});

router.get('/portfolios/:ownerName', async (req, res) => {
  try {
    const ownerName = decodeURIComponent(req.params.ownerName);
    const result = await api.buildings.getByOwner(ownerName);

    const buildingsList = result.ok ? (result.data || []) : [];
    const mappedBuildings = buildingsList.map(b => ({
      ...b,
      address: b.streetAddress || b.address || ''
    }));

    return res.render('portfolios/detail', {
      pageTitle: `${ownerName} Portfolio — LeaseWise NYC`,
      portfolio: { name: ownerName, buildingCount: mappedBuildings.length },
      buildings: mappedBuildings,
      scripts: SCRIPTS
    });
  } catch {
    return res.status(500).render('errors/500', {
      pageTitle: 'Error — LeaseWise NYC'
    });
  }
});

export default router;
