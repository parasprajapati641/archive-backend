// routes/liferoom.routes.js
import express from "express";
import Liferoom from "../models/Liferoom.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const liferoom = await Liferoom.create(req.body);
    res.status(200).json(liferoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { name, city, country } = req.query;

    let query = { isPublic: true };

    if (name) {
      query.fullName = { $regex: name, $options: "i" };
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (country && country !== "any") {
      query.country = country;
    }

    const data = await Liferoom.find(query).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const room = await Liferoom.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Not found" });
  res.json(room);
});

export default router;