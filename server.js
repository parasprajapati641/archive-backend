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
  "https://theliferoomarchive.com", // live domain
  "https://www.theliferoomarchive.com", // with www if applicable
  "http://localhost:8080",            // local frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // origin null allow karva (Postman / server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


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
