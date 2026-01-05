import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import session from "express-session";
import authRoutes from "./src/routes/authRoutes.js";
import liferoomRoutes from "./src/routes/liferoom.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",  
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
console.log("process.env.FRONTEND_URL",process.env.FRONTEND_URL);

app.options("*", cors());
app.use(express.json());

// Session configuration (for passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ROUTES
app.use("/api", authRoutes);
app.use("/api/liferoom", liferoomRoutes);

// TEST ROUTE
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () =>
      console.log("🚀 Server started")
    );
  } catch (err) {
    console.error(err);
  }
};

startServer();

export default app;