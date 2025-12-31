import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

export const sendEmailLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    // 🔐 short lived token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // ✅ EMAIL MUST HIT BACKEND
    const loginLink = `http://localhost:5000/api/verify-email?token=${token}`;

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
    });
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
    const authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ FRONTEND REDIRECT
    res.redirect(
      `${process.env.FRONTEND_URL}/email-login?token=${authToken}`
    );
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
