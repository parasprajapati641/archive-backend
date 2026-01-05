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
];

// 🔹 CORS middleware (live + local + Postman)
app.use(cors({
  origin: function(origin, callback) {
    // null origin (Postman / server-to-server) allow
    if (!origin) return callback(null, true);

    // allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin); // debug
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// 🔹 Handle all OPTIONS requests for preflight
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

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
