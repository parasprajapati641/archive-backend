import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    await User.create({
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Signup successful",
       status: 200,
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

    if (!email || !password){ 
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Explicit 200 status
    return res.status(200).json({
      message: "Login successfully",
      status: 200,
      token,
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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const loginLink = `${process.env.FRONTEND_URL}/email-login?token=${token}`;

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
      return res.status(400).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isEmailVerified = true;
    await user.save();

    // create auth token (normal login token)
    const authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    res.status(401).json({ message: "Invalid or expired link" });
  }
};



