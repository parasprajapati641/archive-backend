import express from "express";
import { signup, login, sendEmailLink, verifyEmailLink } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/email-link", sendEmailLink);
router.get("/verify-email", verifyEmailLink);

export default router;
 