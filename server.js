import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

// Middleware
// app.use(
//   cors({
//     origin:
//       process.env.FRONTEND_URL ||
//       "https://www.theliferoomarchive.com" ||
//       "http://localhost:8080",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.options("*", cors());

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:8080",
    "https://theliferoomarchive.com",
    "https://www.theliferoomarchive.com",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // 🔥 VERY IMPORTANT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});
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

// ROUTES
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

// TEST ROUTE
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () =>
      console.log("🚀 Server started")
    );
  } catch (err) {
    console.error(err);
  }
};

startServer();
