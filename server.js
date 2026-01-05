import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./src/config/passport.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";
import connectDB from "./db.js";

dotenv.config();

const app = express();

/* 🔥 DB connect (NO await, NO listen) */
connectDB();

/* 🔥 CORS (NO credentials on Vercel) */
app.use(cors({
  origin: "https://theliferoomarchive.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.options("*", cors());

app.use(express.json());

/* 🔥 Passport (NO session) */
app.use(passport.initialize());

/* Routes */
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

/* Health check */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

/* ❌ NO app.listen() */
export default app;
