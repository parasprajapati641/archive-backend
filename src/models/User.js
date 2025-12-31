import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String },
  picture: { type: String },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
