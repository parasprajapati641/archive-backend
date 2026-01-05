import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

/* =========================
   🔥 ABSOLUTE FINAL CORS
========================= */
const allowedOrigins = [
  "https://theliferoomarchive.com",
];

app.use((req, res, next) => {
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
    return res.sendStatus(204);
  }

  next();
});

/* ========================= */

app.use(express.json());

/* ROUTES */
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* START SERVER */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server started");
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
