import express from "express";
import mongoose from "mongoose";
const router = express.Router();

const FormSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  message: String,
});

const Form = mongoose.model("Form", FormSchema);

router.post("/", async (req, res) => {
  try {
    const data = await Form.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
