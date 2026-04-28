import { Router } from "express";

import { renderFeaturePage } from "./route-utils.js";

const router = Router();

router.get("/login", (req, res) => {
  return renderFeaturePage(res, {
    title: "Login",
    routeGroup: "Authentication",
    pagePath: req.path,
    description: "This page is a placeholder for account sign-in.",
    todoItems: [
      "Users will be able to sign in with their registered email and password.",
      "Validation, error handling, and password recovery links will appear here.",
      "Successful sign-in will return users to their intended destination.",
    ],
  });
});

router.get("/register", (req, res) => {
  return res.render("auth/register", {
    title: "Register",
    formData: {},
    errors: [],
  });
});

export default router;
