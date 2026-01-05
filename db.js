import mongoose from "mongoose";

let cached = global.mongoose; // cache for serverless
if (!cached) cached = global.mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB connected ✅");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
