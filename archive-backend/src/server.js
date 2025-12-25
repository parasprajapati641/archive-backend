import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import archiveRoutes from "./routes/archiveRoutes.js";

dotenv.config();

const app = express();

// ✅ CORS (ONLY FRONTEND URL)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-frontend.netlify.app"
  ],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// ✅ DB connect
connectDB();

// ✅ Routes
app.use("/api/form", archiveRoutes);

// ✅ Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
