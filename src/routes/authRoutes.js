import express from "express";
import passport from "../config/passport.js";
import {
  signup,
  login,
  sendEmailLink,
  verifyEmailLink,
  googleCallback,
  forgotPassword,
  resetPassword,
  requestEmailChange,
  verifyEmailChange,
} from "../controllers/authController.js";
import Liferoom from "../models/Liferoom.js";
import User from "../models/User.js";
import { protect } from "../config/auth.js";

const router = express.Router();

// Email/Password routes
router.post("/signup", signup);
router.post("/login", login);

// Email magic link routes
router.post("/email-link", sendEmailLink);
router.get("/verify-email", verifyEmailLink);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// CHANGE EMAIL
router.post("/change-email/request", protect, requestEmailChange);
router.get("/change-email/verify", verifyEmailChange);

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

/* ✅ DELETE ACCOUNT ROUTE — ALWAYS AVAILABLE */
router.delete("/delete-account", protect, async (req, res) => { 

  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    await Liferoom.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
})


export default router;
