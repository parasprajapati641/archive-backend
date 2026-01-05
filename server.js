import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

// CONNECT DB (top-level await supported)
await connectDB();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

// TEST ROUTE
app.get("/", (req, res) => res.send("Backend is running 🚀"));

export default app;
