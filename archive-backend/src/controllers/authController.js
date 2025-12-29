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

    res.status(201).json({
      message: "Signup successful",
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

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

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

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

