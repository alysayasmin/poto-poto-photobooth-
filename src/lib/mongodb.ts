import "server-only";
import mongoose from "mongoose";
import { requiredEnv } from "@/lib/server-env";
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });
export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(requiredEnv("MONGODB_URI"), {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      bufferCommands: false,
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.conn = null;
    throw error;
  } finally {
    cached.promise = null;
  }
}
