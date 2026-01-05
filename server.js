import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

/* CORS – FINAL */
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://theliferoomarchive.com",
    "https://www.theliferoomarchive.com",
    "http://localhost:8080",
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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

/* Routes */
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

app.get("/", (req, res) => res.send("Backend running 🚀"));

export default app;
