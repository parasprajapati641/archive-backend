import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import sendEmail from "../config/sendEmail.js";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { protect } from "../config/auth.js";

// SIGN UP
export const signup = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // 🔥 DEBUG

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Signup successful",
      status: 200,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR 👉", err); // 🔥 REAL ERROR
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created with Google. Please use Google login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Explicit 200 status
    return res.status(200).json({
      message: "Login successfully",
      token,
      status: 200,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

/**
 * SEND EMAIL LOGIN LINK
 */
export const sendEmailLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    // 🔐 short lived token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    // ✅ EMAIL MUST HIT BACKEND
    const loginLink = `${process.env.BACKEND_URL}/api/verify-email?token=${token}`;
    // const loginLink = `https://archive-backend-nu.vercel.app/api/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Auth App" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Login Link",
      html: `
        <h3>Login to your account</h3>
        <p>This link will expire in 10 minutes</p>
        <a href="${loginLink}">Click here to login</a>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Login link sent to email",
      status: 200,
      email:email,
      userId: user._id, 
    });

    console.log("res", res);
    
  } catch (error) {
    console.error("EMAIL LINK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VERIFY EMAIL LOGIN TOKEN
 */
export const verifyEmailLink = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.redirect(
        `${process.env.FRONTEND_URL}/email-login?error=token_missing`
      );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user)
      return res.redirect(
        `${process.env.FRONTEND_URL}/email-login?error=user_not_found`
      );

    user.isEmailVerified = true;
    await user.save();

    // 🔐 long lived auth token
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ FRONTEND REDIRECT
    res.redirect(`${process.env.FRONTEND_URL}/email-login?token=${authToken}`);
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/email-login?error=invalid_or_expired`
    );
  }
};

/**
 * GOOGLE OAUTH CALLBACK
 * This handles the callback after Google authentication
 */
export const googleCallback = async (req, res) => {
  try {
    const user = req.user; // User from passport

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Redirect to frontend with token
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/auth/callback?token=${token}&email=${encodeURIComponent(user.email)}`
    );
  } catch (error) {
    console.error("GOOGLE CALLBACK ERROR:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// forgot-password
export const forgotPassword = async (req, res) => {
  try {
    console.log("📩 Forgot password API hit");

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // SECURITY: same response
      return res.status(400).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save hashed token in DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes</p>
      `,
    });

    res.status(200).json({
      message: "Password reset link sent successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by hashed token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// change email
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;

    // ✅ ALWAYS from token
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔑 generate PLAIN token
    const plainToken = crypto.randomBytes(32).toString("hex");

    // 🔒 hash token for DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    // save
    user.pendingEmail = newEmail;
    user.emailChangeToken = hashedToken;
    user.emailChangeExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email-change?token=${plainToken}`;

    // 📧 SEND EMAIL
    await sendEmail({
      to: newEmail,
      subject: "Verify your new email",
      html: `
        <h2>Email Change Request</h2>
        <p>Click the link below to verify your new email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    console.log("===== EMAIL CHANGE DEBUG =====");
    console.log("USER ID:", userId);
    console.log("PLAIN TOKEN:", plainToken);
    console.log("HASHED TOKEN:", hashedToken);
    console.log("EXPIRES:", user.emailChangeExpires);
    console.log("==============================");

    return res.status(200).json({
      success: true,
      verifyLink, // dev only
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Request failed" });
  }
};

export const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.query;

    console.log("===== VERIFY DEBUG =====");
    console.log("PLAIN TOKEN FROM URL:", token);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    console.log("HASHED TOKEN:", hashedToken);

    const user = await User.findOne({
      emailChangeToken: hashedToken,
      emailChangeExpires: { $gt: Date.now() },
    });

    console.log("USER FOUND:", !!user);
    console.log("========================");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      email: user.email, // 🔥 SEND UPDATED EMAIL
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};
