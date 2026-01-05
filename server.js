import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

/* ✅ CORS setup — Vercel compatible */
const allowedOrigins = [
  "http://localhost:8080",
  "https://theliferoomarchive.com",
  "https://www.theliferoomarchive.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server requests like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ✅ JSON parser */
app.use(express.json());

/* ✅ Routes */
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

/* ✅ Test route */
app.get("/", async (req, res) => {
  await connectDB(); // ensure DB connected
  res.send("Backend running 🚀");
});

/* ❌ DO NOT listen() on Vercel */
export default app;
