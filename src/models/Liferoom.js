import mongoose from "mongoose";

const liferoomSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, index: true },
    message: { type: String },
    city: { type: String, index: true },
    country: { type: String, index: true },
    date: { type: String },
    isPublic: { type: Boolean, default: false }, 
     
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     deleteRequested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Liferoom", liferoomSchema);
