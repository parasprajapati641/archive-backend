// routes/liferoom.routes.js
import express from "express";
import Liferoom from "../models/Liferoom.js";
import { protect } from "../config/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    // const liferoom = await Liferoom.create(req.body);
    const liferoom = await Liferoom.create({
      ...req.body,
      // userId: req.body.userId,   
      userId: req.user.id,   
    }); 
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

// GET /api/liferoom/my?userId=123
router.get("/my", protect, async (req, res) => {
  try {
    const userId = req.user.id; 

    const liferooms = await Liferoom.find({ userId }).sort({
      createdAt: -1,
    });
 
    return res.status(200).json(liferooms); // ✅ ONLY ONCE
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});



router.get("/:id", async (req, res) => {
  const room = await Liferoom.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Not found" });
  res.json(room);
});

// 24h edit check function
const canEdit = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  return (now - created) / (1000 * 60 * 60) <= 24;
};

// PUT /api/liferoom/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const liferoom = await Liferoom.findById(req.params.id);
    
    if (!liferoom)
      return res.status(404).json({ message: "Not found" });
    
    if (liferoom.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });
    
    if (!canEdit(liferoom.createdAt))
      return res.status(403).json({ message: "Edit window expired" });
    
    const updated = await Liferoom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/liferoom/:id/request-delete
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE API HIT");
    console.log("ID RECEIVED:", req.params.id);
    
    const liferoom = await Liferoom.findByIdAndDelete(req.params.id);
    
    console.log("DELETED DATA:", liferoom);
    
    if (!liferoom) {
      return res.status(404).json({ message: "Not found" });
    }
    
    res.json({ message: "Liferoom deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;



