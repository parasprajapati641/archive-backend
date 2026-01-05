import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER 👉", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id:decoded.id || decoded.userId || decoded._id }; // req.user.id   

    next();
  } catch (err) { 
    return res.status(401).json({ message: "Invalid token" });
  }
};
