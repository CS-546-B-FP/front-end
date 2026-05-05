import { Router } from "express";

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
  return res.render("auth/register", {
    title: "Register",
    formData: {},
    errors: [],
  });
});

router.post("/register", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
