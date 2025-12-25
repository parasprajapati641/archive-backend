import express from "express";
import Archive from "../models/Archive.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = await Archive.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
