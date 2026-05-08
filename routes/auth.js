import crypto from "crypto";
import { Router } from "express";
import * as api from "../services/api.js";
import {
  getUserFriendlyApiError,
  getUnexpectedErrorMessage,
} from "../utils/errors.js";

const router = Router();
const AUTH_SCRIPTS = ["/public/js/loading-form.js", "/public/js/app.js"];
const AUTH_CSRF_SESSION_KEY = "authCsrfToken";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getSafeReturnTo(value) {
  if (typeof value !== "string") return "";

  const returnTo = value.trim();
  if (
    !returnTo ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\")
  ) {
    return "";
  }

  const pathname = returnTo.split("?")[0].split("#")[0];
  if (["/login", "/register", "/logout"].includes(pathname)) {
    return "";
  }

  return returnTo;
}

function getRequestedReturnTo(req) {
  return getSafeReturnTo(req.body?.returnTo || req.query?.returnTo);
}

function buildAuthUrl(path, returnTo) {
  const safeReturnTo = getSafeReturnTo(returnTo);
  if (!safeReturnTo) return path;

  const params = new URLSearchParams({ returnTo: safeReturnTo });
  return `${path}?${params.toString()}`;
}

function getAuthCsrfToken(req) {
  if (!req.session[AUTH_CSRF_SESSION_KEY]) {
    req.session[AUTH_CSRF_SESSION_KEY] = crypto.randomBytes(32).toString("hex");
  }

  return req.session[AUTH_CSRF_SESSION_KEY];
}

function isValidAuthCsrf(req) {
  const expected = req.session?.[AUTH_CSRF_SESSION_KEY];
  const submitted = typeof req.body?._csrf === "string" ? req.body._csrf : "";

  return Boolean(expected && submitted && expected === submitted);
}

function renderLogin(req, res, { formData = {}, errors = [], status = 200 } = {}) {
  const returnTo = getSafeReturnTo(formData.returnTo) || getRequestedReturnTo(req);

  return res.status(status).render("auth/login", {
    pageTitle: "Login — LeaseWise NYC",
    formData: { ...formData, returnTo },
    errors,
    csrfToken: getAuthCsrfToken(req),
    registerUrl: buildAuthUrl("/register", returnTo),
    scripts: AUTH_SCRIPTS,
  });
}

function renderRegister(req, res, { formData = {}, errors = [], status = 200 } = {}) {
  const returnTo = getSafeReturnTo(formData.returnTo) || getRequestedReturnTo(req);

  return res.status(status).render("auth/register", {
    pageTitle: "Register — LeaseWise NYC",
    formData: { ...formData, returnTo },
    errors,
    csrfToken: getAuthCsrfToken(req),
    loginUrl: buildAuthUrl("/login", returnTo),
    scripts: AUTH_SCRIPTS,
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

async function establishAuthenticatedSession(req, authResult) {
  const backendCookie = authResult.setCookie || "";
  let user = authResult.data;
  let watchlistIds = [];

  if (backendCookie) {
    const profileResult = await api.users.getProfile(backendCookie);
    if (profileResult.ok && profileResult.data) {
      user = profileResult.data;
      if (Array.isArray(profileResult.data.watchlist)) {
        watchlistIds = profileResult.data.watchlist;
      }
    }
  }

  await regenerateSession(req);

  req.session.user = user;
  req.session.backendCookie = backendCookie;
  req.session.watchlistIds = watchlistIds;

  await saveSession(req);
}

router.get("/login", (req, res) => {
  const returnTo = getRequestedReturnTo(req);
  if (req.session.user) return res.redirect(returnTo || "/");
  return renderLogin(req, res);
});

router.post("/login", async (req, res) => {
  const username = normalizeText(req.body.username);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const returnTo = getRequestedReturnTo(req);

  if (!isValidAuthCsrf(req)) {
    return renderLogin(req, res, {
      formData: { username, returnTo },
      errors: [{ message: "Your login session expired. Please try again." }],
      status: 403,
    });
  }

  if (!username || !password) {
    return renderLogin(req, res, {
      formData: { username, returnTo },
      errors: [{ message: "Username and password are required." }],
    });
  }

  try {
    const result = await api.auth.login(username, password);

    if (!result.ok) {
      return renderLogin(req, res, {
        formData: { username, returnTo },
        errors: [
          {
            message: getUserFriendlyApiError(
              result,
              "Invalid username or password.",
            ),
          },
        ],
      });
    }

    await establishAuthenticatedSession(req, result);

    return res.redirect(returnTo || "/");
  } catch {
    return renderLogin(req, res, {
      formData: { username, returnTo },
      errors: [{ message: getUnexpectedErrorMessage() }],
    });
  }
});

router.get("/register", (req, res) => {
  const returnTo = getRequestedReturnTo(req);
  if (req.session.user) return res.redirect(returnTo || "/");
  return renderRegister(req, res);
});

router.post("/register", async (req, res) => {
  const firstName = normalizeText(req.body.firstName);
  const lastName = normalizeText(req.body.lastName);
  const email = normalizeText(req.body.email);
  const username = normalizeText(req.body.username);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const confirmPassword =
    typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";
  const returnTo = getRequestedReturnTo(req);
  const formData = { firstName, lastName, email, username, returnTo };

  if (!isValidAuthCsrf(req)) {
    return renderRegister(req, res, {
      formData,
      errors: [{ message: "Your registration session expired. Please try again." }],
      status: 403,
    });
  }

  if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
    return renderRegister(req, res, {
      formData,
      errors: [{ message: "All fields are required." }],
    });
  }

  if (password !== confirmPassword) {
    return renderRegister(req, res, {
      formData,
      errors: [{ message: "Passwords must match." }],
    });
  }

  try {
    const result = await api.auth.register({
      firstName,
      lastName,
      email,
      username,
      password,
    });

    if (!result.ok) {
      return renderRegister(req, res, {
        formData,
        errors: [
          {
            message: getUserFriendlyApiError(
              result,
              "Registration failed. Please try again.",
            ),
          },
        ],
      });
    }

    const loginResult = await api.auth.login(username, password);
    if (!loginResult.ok) {
      return res.redirect(buildAuthUrl("/login", returnTo));
    }

    await establishAuthenticatedSession(req, loginResult);

    return res.redirect(returnTo || "/");
  } catch {
    return renderRegister(req, res, {
      formData,
      errors: [{ message: getUnexpectedErrorMessage() }],
    });
  }
});

router.get("/logout", (req, res) => {
  const cookie = req.session.backendCookie;
  if (cookie) {
    api.auth.logout(cookie).catch(() => {});
  }
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
