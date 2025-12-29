import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import connectDB from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl
  });
});

// Start server after DB connects
const startServer = async () => {
  try {
    await connectDB(); // wait until DB connected
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
