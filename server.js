import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

// ✅ Allowed origins (local + live)
const allowedOrigins = [
  "http://localhost:8080",
  "https://theliferoomarchive.com",
  "https://www.theliferoomarchive.com",
  "https://your-project-name.vercel.app", // temporary live preview
];

// CORS middleware (live + local + Postman)
app.use(cors({
  origin: true, // allow all origins temporarily
  credentials: true,
}));

app.options("*", cors()); // preflight

// JSON parser
app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

// TEST ROUTE
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () => console.log("🚀 Server started"));
  } catch (err) {
    console.error(err);
  }
};

startServer();
