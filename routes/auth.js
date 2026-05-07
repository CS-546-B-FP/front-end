import { Router } from "express";
import * as api from "../services/api.js";
import {
  getUserFriendlyApiError,
  getUnexpectedErrorMessage,
} from "../utils/errors.js";

const router = Router();

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  return res.render("auth/login", {
    pageTitle: "Login — LeaseWise NYC",
    formData: {},
    errors: [],
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("auth/login", {
      pageTitle: "Login — LeaseWise NYC",
      formData: { username },
      errors: [{ message: "Username and password are required." }],
    });
  }

  try {
    const result = await api.auth.login(username, password);

    if (!result.ok) {
      return res.render("auth/login", {
        pageTitle: "Login — LeaseWise NYC",
        formData: { username },
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

    req.session.user = result.data;
    req.session.backendCookie = result.setCookie || "";

    // Fetch full profile to get watchlist IDs
    const profileResult = await api.users.getProfile(result.setCookie || "");
    if (profileResult.ok && Array.isArray(profileResult.data?.watchlist)) {
      req.session.watchlistIds = profileResult.data.watchlist;
    }

    return res.redirect("/");
  } catch {
    return res.render("auth/login", {
      pageTitle: "Login — LeaseWise NYC",
      formData: { username },
      errors: [{ message: getUnexpectedErrorMessage() }],
    });
  }
});

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/");
  return res.render("auth/register", {
    pageTitle: "Register — LeaseWise NYC",
    formData: {},
    errors: [],
  });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
    return res.render("auth/register", {
      pageTitle: "Register — LeaseWise NYC",
      formData: { firstName, lastName, email, username },
      errors: [{ message: "All fields are required." }],
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
      return res.render("auth/register", {
        pageTitle: "Register — LeaseWise NYC",
        formData: { firstName, lastName, email, username },
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

    return res.redirect("/login");
  } catch {
    return res.render("auth/register", {
      pageTitle: "Register — LeaseWise NYC",
      formData: { firstName, lastName, email, username },
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
