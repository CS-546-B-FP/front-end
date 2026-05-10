import { Router } from "express";
import {
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
  "/public/js/app.js",
];

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
      neighborhood,
      riskLevel,
      sortBy,
      sortOrder,
      page,
      limit
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
  } catch {
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

    return res.render("buildings/detail", {
      pageTitle: `${building.address} — LeaseWise NYC`,
      building,
      reviews,
      isWatched,
      userShortlists,
      reviewError,
      scripts: [
        "/public/js/dialog.js",
        "/public/js/watchlist.js",
        "/public/js/review-form.js",
        "/public/js/app.js",
      ],
    });
  } catch {
    return res.status(500).render("errors/500", {
      pageTitle: "Error — LeaseWise NYC",
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
  } catch {
    return res.status(500).render("errors/500", {
      pageTitle: "Error — LeaseWise NYC",
    });
  }
});

export default router;
