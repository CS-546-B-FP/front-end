import { Router } from "express";
import {
  toBuildingListViewModel,
  toBuildingSearchViewModel,
  toBuildingViewModel,
  toPortfolioViewModel,
  toReviewListViewModel,
  toShortlistListViewModel
} from "../adapters/view-models.js";
import * as api from "../services/api.js";
import {
  getUserFriendlyApiError,
  getUnexpectedErrorMessage,
} from "../utils/errors.js";

const router = Router();

const SCRIPTS = [
  "/public/js/dialog.js",
  "/public/js/watchlist.js",
  "/public/js/custom-weight.js",
  "/public/js/app.js",
];

const VALID_RISK_LEVELS = new Set(['Low', 'Medium', 'High']);
const VALID_SORT_BY = new Set(['risk', 'reviews', 'date']);
const VALID_SORT_ORDERS = new Set(['asc', 'desc']);

const sanitizeEnum = (value, allowed) =>
  typeof value === 'string' && allowed.has(value) ? value : undefined;

const sanitizePositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : undefined;
};

router.get("/", (req, res) => {
  res.render("home", {
    pageTitle: "LeaseWise NYC — Know before you lease",
    scripts: SCRIPTS,
  });
});

router.get("/buildings", async (req, res) => {
  try {
    const {
      search,
      borough,
      neighborhood,
      riskLevel,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;
    const result = await api.buildings.list({
      search,
      borough,
      neighborhood: typeof neighborhood === 'string' ? neighborhood : undefined,
      riskLevel: sanitizeEnum(riskLevel, VALID_RISK_LEVELS),
      sortBy: sanitizeEnum(sortBy, VALID_SORT_BY),
      sortOrder: sanitizeEnum(sortOrder, VALID_SORT_ORDERS),
      page: sanitizePositiveInt(page),
      limit: sanitizePositiveInt(limit),
    });

    if (!result.ok) {
      return res.render("buildings/index", {
        pageTitle: "Browse Buildings — LeaseWise NYC",
        buildings: [],
        error: getUserFriendlyApiError(
          result,
          "Failed to load buildings. Please try again later.",
        ),
        scripts: SCRIPTS,
      });
    }

    const { buildings, pagination } = toBuildingSearchViewModel(result.data);

    let watchlistIds = [];
    if (req.session.user && req.session.backendCookie) {
      watchlistIds = req.session.watchlistIds || [];
    }

    return res.render("buildings/index", {
      pageTitle: "Browse Buildings — LeaseWise NYC",
      buildings,
      pagination,
      watchlistIds,
      scripts: SCRIPTS,
    });
  } catch (err) {
    console.error('[/buildings] Unexpected error:', err);
    return res.render("buildings/index", {
      pageTitle: "Browse Buildings — LeaseWise NYC",
      buildings: [],
      error: getUnexpectedErrorMessage(),
      scripts: SCRIPTS,
    });
  }
});

router.get("/buildings/:id", async (req, res) => {
  try {
    const cookie = req.session?.backendCookie;
    const [buildingResult, reviewsResult] = await Promise.all([
      api.buildings.getById(req.params.id),
      api.reviews.getForBuilding(req.params.id),
    ]);

    if (!buildingResult.ok) {
      return res.status(404).render("errors/404", {
        pageTitle: "Building Not Found — LeaseWise NYC",
      });
    }

    const building = toBuildingViewModel(buildingResult.data);
    const reviews = toReviewListViewModel(reviewsResult.ok ? reviewsResult.data : []);

    let isWatched = false;
    let userShortlists = [];

    if (req.session.user && cookie) {
      const watchlistIds = req.session.watchlistIds || [];
      isWatched = watchlistIds.some(
        (id) => String(id) === String(building._id),
      );

      const slResult = await api.shortlists.list(cookie);
      if (slResult.ok) {
        userShortlists = toShortlistListViewModel(slResult.data);
      }
    }

    const reviewError = reviewsResult.ok
      ? ""
      : getUserFriendlyApiError(reviewsResult, "Reviews could not be loaded.");

    let alternatives = [];
    if (building.riskSummary && building.riskSummary.level !== 'low') {
      try {
        const altResult = await api.buildings.getAlternatives(req.params.id, 5);
        if (altResult.ok && altResult.data) {
          alternatives = toBuildingListViewModel(altResult.data.alternatives || altResult.data || []);
        }
      } catch { /* ignore */ }
    }

    return res.render("buildings/detail", {
      pageTitle: `${building.address} — LeaseWise NYC`,
      building,
      reviews,
      isWatched,
      userShortlists,
      reviewError,
      alternatives,
      scripts: [
        "/public/js/dialog.js",
        "/public/js/watchlist.js",
        "/public/js/review-form.js",
        "/public/js/review-manage.js",
        "/public/js/app.js",
      ],
    });
  } catch (err) {
    console.error('[/buildings/:id] Unexpected error:', err);
    return res.status(500).render("errors/500", {
      pageTitle: "Error — LeaseWise NYC",
    });
  }
});

router.get("/trends", async (req, res) => {
  try {
    const { borough } = req.query;
    const result = await api.buildings.getTrends(borough);

    return res.render("trends", {
      pageTitle: "Neighborhood Trends — LeaseWise NYC",
      trends: result.ok ? result.data : [],
      selectedBorough: borough || '',
      scripts: SCRIPTS,
    });
  } catch (err) {
    console.error('[/trends] Unexpected error:', err);
    return res.render("trends", {
      pageTitle: "Neighborhood Trends — LeaseWise NYC",
      trends: [],
      selectedBorough: '',
      scripts: SCRIPTS,
    });
  }
});

router.get("/portfolios/:ownerName", async (req, res) => {
  try {
    const ownerName = decodeURIComponent(req.params.ownerName);
    const result = await api.buildings.getByOwner(ownerName);

    const { portfolio, buildings } = toPortfolioViewModel(
      ownerName,
      result.ok ? result.data || [] : []
    );

    return res.render("portfolios/detail", {
      pageTitle: `${ownerName} Portfolio — LeaseWise NYC`,
      portfolio,
      buildings,
      scripts: SCRIPTS,
    });
  } catch (err) {
    console.error('[/portfolios/:ownerName] Unexpected error:', err);
    return res.status(500).render("errors/500", {
      pageTitle: "Error — LeaseWise NYC",
    });
  }
});

export default router;
