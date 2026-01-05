import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";
import connectDB from "./db.js";

dotenv.config();

const app = express();

/* 🔥 CONNECT DB (once per cold start) */
connectDB();

/* 🔥 CORS (STATIC ORIGIN ONLY) */
app.use(cors({
  origin: "https://theliferoomarchive.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json());

/* 🔥 Passport (NO session on Vercel) */
app.use(passport.initialize());

/* Routes */
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

/* Debug */
app.use((req, res, next) => {
  console.log("HIT =>", req.method, req.url);
  next();
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

/* ❌ DO NOT app.listen() */
export default app;
