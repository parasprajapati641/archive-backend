import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/authRoutes.js";
import connectDB from "./db.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());

// Session configuration (for passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);

app.use((req, res, next) => {
  console.log("HIT =>", req.method, req.url);
  next();
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl
  });
});

console.log("AUTH ROUTES LOADED", authRoutes);



// Start server after DB connects
const startServer = async () => {
  try {
    await connectDB(); // wait until DB connected
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
