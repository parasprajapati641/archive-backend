import express from "express";
import passport from "../config/passport.js";
import {
  signup,
  login,
  sendEmailLink,
  verifyEmailLink,
  googleCallback,
} from "../controllers/authController.js";

const router = express.Router();

// Email/Password routes
router.post("/signup", signup);
router.post("/login", login);

// Email magic link routes
router.post("/email-link", sendEmailLink);
router.get("/verify-email", verifyEmailLink);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    googleCallback
  );
} else {
  // Return error if Google OAuth is not configured
  router.get("/auth/google", (req, res) => {
    res.status(503).json({
      success: false,
      message:
        "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
    });
  });

  router.get("/auth/google/callback", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Google OAuth is not configured.",
    });
  });
}

export default router;
