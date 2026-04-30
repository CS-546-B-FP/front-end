import { Router } from "express";

import { renderFeaturePage } from "./route-utils.js";

const router = Router();

router.get("/login", (req, res) => {
  return res.render("auth/login", {
    title: "Login",
    formData: {},
    errors: [],
  });
});

router.post("/login", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.get("/register", (req, res) => {
  return renderFeaturePage(res, {
    title: "Register",
    routeGroup: "Authentication",
    pagePath: req.path,
    description: "This page is a placeholder for account registration.",
    todoItems: [
      "New users will be able to create an account here.",
      "Required profile fields and password rules will be presented here.",
      "Submission feedback and account verification steps will appear here.",
    ],
  });
});

router.post("/register", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
